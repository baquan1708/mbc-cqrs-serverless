import { Command } from 'commander'

import uiAction from '../actions/ui.action'

export function uiCommand(program: Command) {
  program
    .command('ui-common')
    .alias('ui')
    .description('add mbc-cqrs-ui-common components to your project.')
    .action(uiAction)
}
