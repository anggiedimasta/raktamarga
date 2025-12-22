import { Outlet } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { useNotificationsSocket } from '@/shared/lib/notifications-socket'

export function RootLayout() {
  useNotificationsSocket()

  return (
    <>
      <Outlet />
      <Toaster />
    </>
  )
}
