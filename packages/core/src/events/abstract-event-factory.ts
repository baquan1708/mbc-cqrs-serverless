/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  DynamoDBStreamEvent,
  EventBridgeEvent,
  S3Event,
  SNSEvent,
  SQSEvent,
} from 'aws-lambda'

import { IEvent, IEventFactory, StepFunctionsEvent } from '../interfaces'

/**
 * An abstract base class for event factory.
 * It provides default empty implementations for all transformation methods,
 * allowing concrete handlers to only override the methods they need.
 */
export abstract class AbstractEventFactory implements IEventFactory {
  async transformSqs(event: SQSEvent): Promise<IEvent[]> {
    return []
  }

  async transformSns(event: SNSEvent): Promise<IEvent[]> {
    return []
  }

  async transformDynamodbStream(event: DynamoDBStreamEvent): Promise<IEvent[]> {
    return []
  }

  async transformEventBridge(
    event: EventBridgeEvent<any, any>,
  ): Promise<IEvent[]> {
    return []
  }

  async transformStepFunction(
    event: StepFunctionsEvent<any>,
  ): Promise<IEvent[]> {
    return []
  }

  async transformS3(event: S3Event): Promise<IEvent[]> {
    return []
  }
}
