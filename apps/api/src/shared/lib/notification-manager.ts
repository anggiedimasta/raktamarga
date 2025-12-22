import { EventEmitter } from 'node:events'
import { auth } from '@raktamarga/auth'

export class NotificationManager {
  private static instance: NotificationManager
  private emitter = new EventEmitter()
  private connections = new Map<string, Set<any>>()

  private constructor() {}

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  public subscribe(userId: string, ws: any) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set())
    }
    this.connections.get(userId)!.add(ws)

    console.log(`User ${userId} subscribed to notifications. Total connections for user: ${this.connections.get(userId)!.size}`)
  }

  public unsubscribe(userId: string, ws: any) {
    const userConnections = this.connections.get(userId)
    if (userConnections) {
      userConnections.delete(ws)
      if (userConnections.size === 0) {
        this.connections.delete(userId)
      }
    }
    console.log(`User ${userId} unsubscribed from notifications.`)
  }

  public notify(userId: string, notification: any) {
    const userConnections = this.connections.get(userId)
    if (userConnections) {
      console.log(`Sending notification to ${userConnections.size} connections for user ${userId}`)
      for (const ws of userConnections) {
        ws.send({
          type: 'notification',
          data: notification
        })
      }
    }
  }

  public async getUserIdFromHeaders(headers: Headers): Promise<string | null> {
    const session = await auth.api.getSession({ headers })
    return session?.user?.id || null
  }
}

export const notificationManager = NotificationManager.getInstance()
