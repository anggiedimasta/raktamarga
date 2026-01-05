import { useState } from 'react'
import { IconBell, IconLoader2, IconChecks } from '@tabler/icons-react'
import { trpc } from '../../../shared/lib/trpc-react'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover'
import { ScrollArea } from '../../../components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

export function NotificationCenter() {
  const [open, setPopoverOpen] = useState(false)
  const utils = trpc.useUtils()

  const { data: unreadData } = trpc.notification.getUnreadCount.useQuery(undefined, {
    refetchInterval: 30000, // Check every 30 seconds
  })

  const { data: notifications, isLoading } = trpc.notification.list.useQuery(
    { limit: 10 },
    { enabled: open }
  )

  const markAsRead = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      utils.notification.getUnreadCount.invalidate()
      utils.notification.list.invalidate()
    },
  })

  const markAllAsRead = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notification.getUnreadCount.invalidate()
      utils.notification.list.invalidate()
    },
  })

  const unreadCount = unreadData?.count || 0

  return (
    <Popover open={open} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <IconBell size={20} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-bottom">
          <h4 className="font-semibold text-sm">Notifikasi</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] h-7 px-2"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <IconChecks size={14} className="mr-1" />
              Tandai semua dibaca
            </Button>
          )}
        </div>
        <ScrollArea className="h-[350px]">
          {isLoading ? (
            <div className="p-8 text-center">
              <IconLoader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-bottom hover:bg-secondary/50 transition-colors cursor-pointer relative ${!notif.read ? 'bg-primary/5' : ''}`}
                  onClick={() => !notif.read && markAsRead.mutate({ id: notif.id })}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className={`text-sm ${!notif.read ? 'font-semibold' : ''}`}>{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: id })}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Tidak ada notifikasi.
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-top text-center">
          <Button variant="ghost" size="sm" className="w-full text-xs h-8">
            Lihat semua
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
