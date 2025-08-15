import {
  AbstractEventFactory,
  EventFactory,
  IEvent,
  StepFunctionsEvent,
} from '@mbc-cqrs-serverless/core'
import { DynamoDBStreamEvent, SQSEvent } from 'aws-lambda'

import { DEFAULT_IMPORT_ACTION_QUEUE } from '../constant'
import { CsvImportSfnEvent } from './csv-import.sfn.event'
import { ImportEvent } from './import.event'
import { ImportQueueEvent } from './import.queue.event'

@EventFactory()
export class ImportEventFactory extends AbstractEventFactory {
  async transformSqs(event: SQSEvent): Promise<IEvent[]> {
    const importEvents = event.Records.map((record) => {
      if (record.eventSourceARN.endsWith(DEFAULT_IMPORT_ACTION_QUEUE)) {
        return new ImportQueueEvent().fromSqsRecord(record)
      }
      return undefined
    }).filter((event): event is ImportQueueEvent => !!event)

    return importEvents
  }

  async transformDynamodbStream(event: DynamoDBStreamEvent): Promise<IEvent[]> {
    const importEvents = event.Records.map((record) => {
      if (
        record.eventSourceARN.endsWith('import_tmp') ||
        record.eventSourceARN.includes('import_tmp' + '/stream/')
      ) {
        if (record.eventName === 'INSERT') {
          return new ImportEvent().fromDynamoDBRecord(record)
        }
      }
      return undefined
    }).filter((event): event is ImportEvent => !!event)

    return importEvents
  }

  async transformStepFunction(
    event: StepFunctionsEvent<any>,
  ): Promise<IEvent[]> {
    if (event.context.StateMachine.Name.includes('import-csv')) {
      return [new CsvImportSfnEvent(event)]
    }
    return []
  }
}
