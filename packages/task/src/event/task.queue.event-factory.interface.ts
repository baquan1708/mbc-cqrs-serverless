import {
  DefaultEventFactory,
  IEvent,
  StepFunctionsEvent,
} from '@mbc-cqrs-serverless/core'
import { SQSEvent } from 'aws-lambda'

import { TaskQueueEvent } from './task.queue.event'
import { StepFunctionTaskEvent } from './task.sfn.event'

export const DEFAULT_TASK_ACTION_QUEUE = 'task-action-queue'

export interface ITaskQueueEventFactory<TEvent extends IEvent = any> {
  transformTask?(event: TaskQueueEvent): Promise<TEvent[]>
  transformStepFunctionTask?(event: StepFunctionTaskEvent): Promise<TEvent[]>
}

export class EventFactoryAddedTask extends DefaultEventFactory {
  async transformSqs(event: SQSEvent): Promise<IEvent[]> {
    const curEvents = await super.transformSqs(event)
    const taskEvents = event.Records.map((record) => {
      if (record.eventSourceARN.endsWith(DEFAULT_TASK_ACTION_QUEUE)) {
        return new TaskQueueEvent().fromSqsRecord(record)
      }
      return undefined
    })
      .filter((event) => !!event)
      .filter((event) => event.taskEvent.taskEntity.sk.split('#').length < 3) // do not process sub task

    return [...taskEvents, ...curEvents]
  }

  async transformStepFunction(
    event: StepFunctionsEvent<any>,
  ): Promise<IEvent[]> {
    if (event.context.StateMachine.Name.includes('sfn-task')) {
      const sfnTaskEvents = new StepFunctionTaskEvent(event)
      return [sfnTaskEvents]
    }
    return super.transformStepFunction(event)
  }
}
