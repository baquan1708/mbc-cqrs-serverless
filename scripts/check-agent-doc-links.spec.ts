import * as fs from 'fs'
import * as path from 'path'

const DOCS_AGENTS_DIR = path.join(__dirname, '..', 'docs', 'agents')
const LINK_RE = /\[[^\]]+\]\(([^)]+)\)/g

function collectMarkdownFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory() && entry.name !== '_generated') {
      files.push(...collectMarkdownFiles(full))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(full)
    }
  }
  return files
}

function resolveLink(fromFile: string, target: string): string | null {
  if (target.startsWith('http://') || target.startsWith('https://')) {
    return null
  }
  if (target.startsWith('#')) {
    return null
  }
  const withoutAnchor = target.split('#')[0]
  if (!withoutAnchor) {
    return null
  }
  return path.normalize(path.resolve(path.dirname(fromFile), withoutAnchor))
}

describe('docs/agents markdown links', () => {
  it('resolves relative links to existing files', () => {
    const files = collectMarkdownFiles(DOCS_AGENTS_DIR)
    const broken: string[] = []

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8')
      let match: RegExpExecArray | null
      while ((match = LINK_RE.exec(content)) !== null) {
        const resolved = resolveLink(file, match[1])
        if (resolved && !fs.existsSync(resolved)) {
          broken.push(`${path.relative(process.cwd(), file)} → ${match[1]}`)
        }
      }
    }

    expect(broken).toEqual([])
  })
})
