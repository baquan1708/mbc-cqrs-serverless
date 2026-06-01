/**
 * Scans monorepo packages and writes contributor agent inventory under docs/agents/_generated/.
 * Run: npm run docs:agents:gen
 */
import * as fs from 'fs'
import * as path from 'path'

const MBC_SCOPE = '@mbc-cqrs-serverless/'
const SKIP_PATH_SEGMENTS = [
  '/schematics/',
  '/templates/',
  '/dist/',
  '/node_modules/',
  '/__tests__/',
]

export interface ModuleEntry {
  className: string
  file: string
}

export interface ServiceEntry {
  className: string
  file: string
}

export interface PackageInventory {
  name: string
  directory: string
  description: string
  dependencies: string[]
  modules: ModuleEntry[]
  services: ServiceEntry[]
  exports: string[]
}

export interface Inventory {
  generatedAt: string
  packages: PackageInventory[]
}

export interface BuildInventoryOptions {
  rootDir: string
}

function shouldSkipFile(filePath: string): boolean {
  return SKIP_PATH_SEGMENTS.some((seg) => filePath.includes(seg))
}

function walkTsFiles(dir: string, results: string[] = []): string[] {
  if (!fs.existsSync(dir)) {
    return results
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') {
        continue
      }
      walkTsFiles(full, results)
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
      results.push(full)
    }
  }
  return results
}

function extractClassNames(
  content: string,
  suffix: 'Module' | 'Service',
): string[] {
  const re = new RegExp(`export\\s+class\\s+(\\w+${suffix})\\b`, 'g')
  const names: string[] = []
  let match: RegExpExecArray | null
  while ((match = re.exec(content)) !== null) {
    names.push(match[1])
  }
  return names
}

function parseMbcDependencies(pkgJson: Record<string, unknown>): string[] {
  const deps: string[] = []
  for (const key of ['dependencies', 'peerDependencies', 'devDependencies']) {
    const section = pkgJson[key] as Record<string, string> | undefined
    if (!section) continue
    for (const name of Object.keys(section)) {
      if (name.startsWith(MBC_SCOPE) && !deps.includes(name)) {
        deps.push(name)
      }
    }
  }
  return deps.sort()
}

function parseIndexExports(indexPath: string): string[] {
  if (!fs.existsSync(indexPath)) {
    return []
  }
  const content = fs.readFileSync(indexPath, 'utf8')
  const exports: string[] = []
  const re = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g
  let match: RegExpExecArray | null
  while ((match = re.exec(content)) !== null) {
    exports.push(match[1])
  }
  return exports
}

export function buildInventory(options: BuildInventoryOptions): Inventory {
  const packagesDir = path.join(options.rootDir, 'packages')
  const packages: PackageInventory[] = []

  for (const dirName of fs.readdirSync(packagesDir)) {
    const pkgDir = path.join(packagesDir, dirName)
    const pkgJsonPath = path.join(pkgDir, 'package.json')
    if (!fs.existsSync(pkgJsonPath)) {
      continue
    }

    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8')) as Record<
      string,
      unknown
    >

    if (pkgJson.private === true) {
      continue
    }

    const name = String(pkgJson.name ?? dirName)
    const srcDir = path.join(pkgDir, 'src')
    const modules: ModuleEntry[] = []
    const services: ServiceEntry[] = []

    for (const file of walkTsFiles(srcDir)) {
      if (shouldSkipFile(file)) {
        continue
      }
      const rel = path.relative(options.rootDir, file)
      const content = fs.readFileSync(file, 'utf8')

      if (file.endsWith('.module.ts')) {
        for (const className of extractClassNames(content, 'Module')) {
          modules.push({ className, file: rel })
        }
      }
      if (file.endsWith('.service.ts')) {
        for (const className of extractClassNames(content, 'Service')) {
          services.push({ className, file: rel })
        }
      }
    }

    modules.sort((a, b) => a.className.localeCompare(b.className))
    services.sort((a, b) => a.className.localeCompare(b.className))

    packages.push({
      name,
      directory: `packages/${dirName}`,
      description: String(pkgJson.description ?? ''),
      dependencies: parseMbcDependencies(pkgJson),
      modules,
      services,
      exports: parseIndexExports(path.join(srcDir, 'index.ts')),
    })
  }

  packages.sort((a, b) => a.name.localeCompare(b.name))

  return {
    generatedAt: new Date().toISOString(),
    packages,
  }
}

function computeUsedBy(packages: PackageInventory[]): Map<string, string[]> {
  const usedBy = new Map<string, string[]>()
  for (const pkg of packages) {
    usedBy.set(pkg.name, [])
  }
  for (const pkg of packages) {
    for (const dep of pkg.dependencies) {
      const list = usedBy.get(dep) ?? []
      list.push(pkg.name)
      usedBy.set(dep, list)
    }
  }
  for (const [name, list] of usedBy) {
    usedBy.set(name, [...new Set(list)].sort())
  }
  return usedBy
}

export function renderModuleServiceIndex(inventory: Inventory): string {
  const usedBy = computeUsedBy(inventory.packages)
  const lines: string[] = [
    '# Module & Service Index (generated)',
    '',
    `> Generated at ${inventory.generatedAt}. Do not edit by hand. Run \`npm run docs:agents:gen\`.`,
    '',
  ]

  for (const pkg of inventory.packages) {
    const consumers = usedBy.get(pkg.name) ?? []
    lines.push(`## ${pkg.name}`)
    lines.push('')
    lines.push(`- **Directory:** \`${pkg.directory}\``)
    if (pkg.description) {
      lines.push(`- **Description:** ${pkg.description}`)
    }
    lines.push(
      `- **Depends on:** ${pkg.dependencies.length ? pkg.dependencies.join(', ') : '(none)'}`,
    )
    lines.push(
      `- **Used by:** ${consumers.length ? consumers.join(', ') : '(none)'}`,
    )
    lines.push('')

    if (pkg.modules.length) {
      lines.push('### Modules')
      lines.push('')
      lines.push('| Class | File |')
      lines.push('|-------|------|')
      for (const m of pkg.modules) {
        lines.push(`| \`${m.className}\` | \`${m.file}\` |`)
      }
      lines.push('')
    }

    if (pkg.services.length) {
      lines.push('### Services')
      lines.push('')
      lines.push('| Class | File |')
      lines.push('|-------|------|')
      for (const s of pkg.services) {
        lines.push(`| \`${s.className}\` | \`${s.file}\` |`)
      }
      lines.push('')
    }

    if (pkg.exports.length) {
      lines.push('### Public exports (`index.ts`)')
      lines.push('')
      for (const exp of pkg.exports) {
        lines.push(`- \`${exp}\``)
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}

export function writeGeneratedDocs(
  rootDir: string,
  inventory: Inventory,
): void {
  const outDir = path.join(rootDir, 'docs', 'agents', '_generated')
  fs.mkdirSync(outDir, { recursive: true })

  fs.writeFileSync(
    path.join(outDir, 'inventory.json'),
    `${JSON.stringify(inventory, null, 2)}\n`,
  )
  fs.writeFileSync(
    path.join(outDir, 'module-service-index.md'),
    `${renderModuleServiceIndex(inventory)}\n`,
  )
}

function main(): void {
  const rootDir = path.resolve(__dirname, '..')
  const inventory = buildInventory({ rootDir })
  writeGeneratedDocs(rootDir, inventory)
  process.stdout.write(
    `Wrote docs/agents/_generated for ${inventory.packages.length} packages\n`,
  )
}

if (require.main === module) {
  main()
}
