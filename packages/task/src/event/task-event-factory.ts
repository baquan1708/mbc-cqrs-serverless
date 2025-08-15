import {
  AbstractEventFactory,
  EventFactory,
  IEvent,
  KEY_SEPARATOR,
  StepFunctionsEvent,
} from '@mbc-cqrs-serverless/core'
import { SQSEvent } from 'aws-lambda'

import { SubTaskQueueEvent } from './sub-task.queue.event'
import { TaskQueueEvent } from './task.queue.event'
import { StepFunctionTaskEvent } from './task.sfn.event'

export const DEFAULT_TASK_ACTION_QUEUE = 'task-action-queue'
export const DEFAULT_SUB_TASK_STATUS_QUEUE = 'sub-task-status-queue'

@EventFactory()
export class TaskEventFactory extends AbstractEventFactory {
  async transformSqs(event: SQSEvent): Promise<IEvent[]> {
    const taskEvents = event.Records.map((record) => {
      if (record.eventSourceARN.endsWith(DEFAULT_TASK_ACTION_QUEUE)) {
        const task = new TaskQueueEvent().fromSqsRecord(record)
        // This logic is preserved: do not handle sub-tasks in this path.
        if (task.taskEvent.taskEntity.sk.split(KEY_SEPARATOR).length > 2) {
          return undefined
        }
        return task
      }
      if (record.eventSourceARN.endsWith(DEFAULT_SUB_TASK_STATUS_QUEUE)) {
        return new SubTaskQueueEvent().fromSqsRecord(record)
      }
      return undefined
    }).filter((event): event is TaskQueueEvent | SubTaskQueueEvent => !!event)

    return taskEvents
  }

  async transformStepFunction(
    event: StepFunctionsEvent<any>,
  ): Promise<IEvent[]> {
    if (event.context.StateMachine.Name.includes('sfn-task')) {
      const sfnTaskEvents = new StepFunctionTaskEvent(event)
      return [sfnTaskEvents]
    }
    return []
  }
}
