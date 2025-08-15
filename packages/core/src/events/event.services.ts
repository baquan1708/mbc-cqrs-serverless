import { Injectable, Logger } from '@nestjs/common'
import {
  DynamoDBStreamEvent,
  EventBridgeEvent,
  S3Event,
  SNSEvent,
  SQSEvent,
} from 'aws-lambda'

import { IEvent, IEventFactory, StepFunctionsEvent } from '../interfaces'
import { DefaultEventFactory } from './default-event-factory'
import { EventBus } from './event-bus'

const EVENT_FACTORY = Symbol()

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name)
  private [EVENT_FACTORY]: IEventFactory[]

  constructor(private readonly eventBus: EventBus) {
    this.setDefaultEventFactory()
  }

  get eventFactory() {
    return this[EVENT_FACTORY]
  }

  set eventFactory(ef: IEventFactory[]) {
    this[EVENT_FACTORY] = ef
  }

  setDefaultEventFactory() {
    this.eventFactory = [new DefaultEventFactory()]
  }

  async handleSnsEvent(raw: SNSEvent) {
    this.logger.debug('handleSnsEvent::', raw)

    const events = await this.transformEvent<SNSEvent>(raw, (f, e) =>
      f.transformSns(e),
    )
    return this.execute(events)
  }

  async handleSqsEvent(raw: SQSEvent) {
    this.logger.debug('handleSqsEvent::', raw)
    // TODO Implementing partial batch responses
    // https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#services-sqs-batchfailurereporting
    const events = await this.transformEvent<SQSEvent>(raw, (f, e) =>
      f.transformSqs(e),
    )
    return this.execute(events)
  }

  async handleDynamoDBEvent(raw: DynamoDBStreamEvent) {
    this.logger.debug('handleDynamoDBEvent::', raw)
    const events = await this.transformEvent<DynamoDBStreamEvent>(raw, (f, e) =>
      f.transformDynamodbStream(e),
    )
    return this.execute(events)
  }

  async handleEventBridgeEvent(raw: EventBridgeEvent<any, any>) {
    this.logger.debug('handleEventBridgeEvent::', raw)
    const events = await this.transformEvent<EventBridgeEvent<any, any>>(
      raw,
      (f, e) => f.transformEventBridge(e),
    )
    return this.execute(events)
  }

  async handleStepFunctionsEvent(raw: StepFunctionsEvent<any>) {
    this.logger.debug('handleStepFunctionsEvent::', raw)
    const events = await this.transformEvent<StepFunctionsEvent<any>>(
      raw,
      (f, e) => f.transformStepFunction(e),
    )
    return this.execute(events)
  }

  async handleS3Event(raw: S3Event) {
    this.logger.debug('handleS3Event::', raw)

    const events = await this.transformEvent<S3Event>(raw, (f, e) =>
      f.transformS3(e),
    )
    return this.execute(events)
  }

  protected execute(events: IEvent[]) {
    return Promise.all(events.map((event) => this.eventBus.execute(event)))
  }

  protected async transformEvent<T>(
    rawEvent: T,
    transformer: (factory: IEventFactory, event: T) => Promise<IEvent[]>,
  ): Promise<IEvent[]> {
    const allEvents = await Promise.all(
      this.eventFactory.map((factory) => transformer(factory, rawEvent)),
    )
    return allEvents.flat()
  }
}
