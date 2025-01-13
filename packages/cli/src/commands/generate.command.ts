import { Command } from 'commander'

import generateAction from '../actions/generate.action'

export async function generateCommand(program: Command) {
  program
    .command('generate <schematic> [name] [path]')
    .alias('g')
    .description(buildDescription())
    .option(
      '-d, --dry-run',
      'Report actions that would be taken without writing out results.',
    )
    .action(generateAction)
}

function buildDescription() {
  // const collection = await this.getCollection()
  return 'Generate a MBC element.'
  // `  Schematics available on ${chalk.bold(collection)} collection:\n` +
  // this.buildSchematicsListAsTable(await this.getSchematics(collection))
}
