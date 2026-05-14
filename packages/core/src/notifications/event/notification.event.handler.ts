import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { EventHandler } from '../../decorators'
import { IEventHandler, INotification } from '../../interfaces'
import { AppSyncService } from '../appsync.service'
import { AppSyncEventsService } from '../appsync-events.service'
import { NotificationEvent } from './notification.event'

export const TRANSPORT_APPSYNC_GRAPHQL = 'appsync-graphql'
export const TRANSPORT_APPSYNC_EVENT = 'appsync-event'

@EventHandler(NotificationEvent)
export class NotificationEventHandler
  implements IEventHandler<NotificationEvent>
{
  private readonly logger = new Logger(NotificationEventHandler.name)

  constructor(
    private readonly appSyncService: AppSyncService,
    private readonly appSyncEventsService: AppSyncEventsService,
    private readonly config: ConfigService,
  ) {}

  async execute(event: NotificationEvent): Promise<void> {
    const body: INotification = JSON.parse(event.body)
    const transports = this.resolveTransports()

    this.logger.debug(`execute:: transports=[${transports.join(', ')}]`)

    await Promise.all(
      transports.map((name) => {
        switch (name) {
          case TRANSPORT_APPSYNC_GRAPHQL:
            return this.appSyncService.sendMessage(body)
          case TRANSPORT_APPSYNC_EVENT:
            return this.appSyncEventsService.sendMessage(body)
          default:
            this.logger.warn(`Unknown transport "${name}", skipping`)
            return Promise.resolve()
        }
      }),
    )
  }

  /**
   * Reads NOTIFICATION_TRANSPORTS at call time (not constructor) to avoid
   * Lambda cold-start caching issues.
   *
   * Defaults to ['appsync-graphql'] when not set — fully backward compatible.
   *
   * Examples:
   *   NOTIFICATION_TRANSPORTS=appsync-graphql
   *   NOTIFICATION_TRANSPORTS=appsync-event
   *   NOTIFICATION_TRANSPORTS=appsync-graphql,appsync-event
   */
  private resolveTransports(): string[] {
    const raw = this.config.get<string>('NOTIFICATION_TRANSPORTS') ?? ''
    const list = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    return list.length ? list : [TRANSPORT_APPSYNC_GRAPHQL]
  }
}
