import { useState } from 'react'
import { IconLogout, IconUser, IconBell } from '@tabler/icons-react'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'
import { Button } from '../../../components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu'
import { authClient, type Session } from '../../../shared/lib/auth'
import { useNavigate } from '@tanstack/react-router'

interface UserMenuProps {
  session: Session | null
}

export function UserMenu({ session }: UserMenuProps) {
  const [imageError, setImageError] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    if (!authClient) return
    try {
      await authClient.signOut()
      window.location.reload()
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  if (!session?.user) return null

  const showImage = session.user.image && !imageError
  const initials = (session.user.name || session.user.email || 'U')[0].toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="relative h-10 w-10">
            <Avatar className="h-10 w-10">
              {showImage && (
                <AvatarImage
                  src={session.user.image!}
                  alt={session.user.name || 'User'}
                  onError={() => setImageError(true)}
                />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{session.user.name || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate({ to: '/settings', search: { tab: 'profile' } as any })}>
          <IconUser className="mr-2 h-4 w-4" />
          <span>Profil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate({ to: '/settings', search: { tab: 'notifications' } as any })}>
          <IconBell className="mr-2 h-4 w-4" />
          <span>Pengaturan Notifikasi</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
          <IconLogout className="mr-2 h-4 w-4" />
          <span>Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
