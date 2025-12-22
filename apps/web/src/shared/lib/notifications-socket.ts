import { useEffect, useRef } from 'react'
import { trpc } from './trpc-react'
import { useSession } from './auth'
import { toast } from 'sonner'
import { config } from '../config'

export function useNotificationsSocket() {
  const { data: session } = useSession()
  const utils = trpc.useUtils()
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!session?.user) return

    // Create websocket connection
    // Note: BetterAuth handles authentication via cookies, which are sent with the WS request
    const wsUrl = `${config.apiUrl.replace('http', 'ws')}/ws/notifications`
    const socket = new WebSocket(wsUrl)
    socketRef.current = socket

    socket.onopen = () => {
      console.log('Notification WebSocket connected')
    }

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)

        if (message.type === 'notification') {
          const notification = message.data

          // Refresh notification data
          utils.notification.getUnreadCount.invalidate()
          utils.notification.list.invalidate()

          // Show toast for new notification
          toast.info(notification.title, {
            description: notification.message,
            action: {
              label: 'Lihat',
              onClick: () => {
                // Handle navigation if needed
              }
            }
          })
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err)
      }
    }

    socket.onclose = () => {
      console.log('Notification WebSocket disconnected')
    }

    socket.onerror = (error) => {
      console.error('Notification WebSocket error:', error)
    }

    return () => {
      socket.close()
    }
  }, [session?.user?.id, utils])

  return socketRef.current
}
