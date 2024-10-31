import { execSync } from 'child_process'
import { Command } from 'commander'
import {
  copyFileSync,
  cpSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'fs'
import path from 'path'

/* eslint-disable no-console */
export default async function newAction(
  name: string = '',
  options: object,
  command: Command,
) {
  console.log(
    `Executing command '${command.name()}' for application '${name}' with options '${JSON.stringify(
      options,
    )}'`,
  )

  const { ver } = options as any

  let packageVersion

  if (ver === 'latest') {
    packageVersion = getPackageVersion('@mbc-cqrs-serverless/core', true)[0]
  } else {
    const versions = getPackageVersion('@mbc-cqrs-serverless/core')
    if (!versions.includes(ver)) {
      console.log(
        'The specified package version does not exist. Please chose a valid version!\n',
        versions,
      )
      return
    }
    packageVersion = ver
  }

  const destDir = path.join(process.cwd(), name)
  console.log('Generating MBC cqrs serverless application in', destDir)
  mkdirSync(destDir, { recursive: true })
  cpSync(path.join(__dirname, '../../templates'), destDir, { recursive: true })

  // upgrade package
  usePackageVersion(destDir, packageVersion, name)

  // mv gitignore .gitignore
  const gitignore = path.join(destDir, 'gitignore')
  copyFileSync(gitignore, path.join(destDir, '.gitignore'))
  unlinkSync(gitignore)
  // cp .env.local .env
  copyFileSync(path.join(destDir, '.env.local'), path.join(destDir, '.env'))

  // git init
  let logs = execSync('git init', { cwd: destDir })
  console.log(logs.toString())

  // npm install
  console.log('Installing packages in', destDir)
  logs = execSync('npm i', { cwd: destDir })
  console.log(logs.toString())
}

function usePackageVersion(
  destDir: string,
  packageVersion: string,
  name?: string,
) {
  const packageJson = JSON.parse(
    readFileSync(path.join(__dirname, '../../package.json')).toString(),
  )
  const fname = path.join(destDir, 'package.json')
  const tplPackageJson = JSON.parse(readFileSync(fname).toString())

  if (name) {
    tplPackageJson.name = name
  }

  tplPackageJson.dependencies['@mbc-cqrs-serverless/core'] = packageVersion
  tplPackageJson.devDependencies['@mbc-cqrs-serverless/cli'] =
    packageJson.version

  writeFileSync(fname, JSON.stringify(tplPackageJson, null, 2))
}

function getPackageVersion(packageName: string, isLatest = false): string[] {
  if (isLatest) {
    const latestVersion = execSync(`npm view ${packageName} dist-tags.latest`)
      .toString()
      .trim()
    return [latestVersion]
  }

  const versions = JSON.parse(
    execSync(`npm view ${packageName} versions --json`).toString(),
  ) as string[]
  return versions
}

export let exportsForTesting = {
  usePackageVersion,
}
if (process.env.NODE_ENV !== 'test') {
  exportsForTesting = undefined
}
