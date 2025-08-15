import { IEvent } from '@mbc-cqrs-serverless/core'

import { TaskQueueEvent } from './task.queue.event'
import { StepFunctionTaskEvent } from './task.sfn.event'

export interface ITaskQueueEventFactory<TEvent extends IEvent = any> {
  transformTask?(event: TaskQueueEvent): Promise<TEvent[]>
  transformStepFunctionTask?(event: StepFunctionTaskEvent): Promise<TEvent[]>
}
