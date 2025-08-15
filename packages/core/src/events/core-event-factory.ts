import { DynamoDBStreamEvent, SQSEvent } from 'aws-lambda'

import { DataSyncNewCommandEvent } from '../command-events/data-sync.new.event'
import { DataSyncCommandSfnEvent } from '../command-events/data-sync.sfn.event'
import { COMMAND_TABLE_SUFFIX, DEFAULT_NOTIFICATION_QUEUE } from '../constants'
import { EventFactory } from '../decorators'
import { IEvent, StepFunctionsEvent } from '../interfaces'
import { NotificationEvent } from '../notifications/event/notification.event'
import { AbstractEventFactory } from './abstract-event-factory'

@EventFactory()
export class CoreEventFactory extends AbstractEventFactory {
  async transformSqs(event: SQSEvent): Promise<IEvent[]> {
    const events = event.Records.map((record) => {
      if (record.eventSourceARN.endsWith(DEFAULT_NOTIFICATION_QUEUE)) {
        return new NotificationEvent().fromSqsRecord(record)
      }
      return undefined
    }).filter((event): event is NotificationEvent => !!event)

    return events
  }

  async transformDynamodbStream(event: DynamoDBStreamEvent): Promise<IEvent[]> {
    const events = event.Records.map((record) => {
      if (
        record.eventSourceARN.endsWith(COMMAND_TABLE_SUFFIX) ||
        record.eventSourceARN.includes(COMMAND_TABLE_SUFFIX + '/stream/')
      ) {
        if (record.eventName === 'INSERT') {
          return new DataSyncNewCommandEvent().fromDynamoDBRecord(record)
        }
      }
      return undefined
    }).filter((event): event is DataSyncNewCommandEvent => !!event)

    return events
  }

  async transformStepFunction(
    event: StepFunctionsEvent<any>,
  ): Promise<IEvent[]> {
    if (event.context.StateMachine.Name.includes('command')) {
      const commandStepFunction = new DataSyncCommandSfnEvent(event)
      return [commandStepFunction]
    }
    return []
  }
}
