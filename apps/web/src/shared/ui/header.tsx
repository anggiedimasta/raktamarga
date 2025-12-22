import { Link } from '@tanstack/react-router'
import { IconLoader2 } from '@tabler/icons-react'
import { useSession, type Session } from '../lib/auth'
import { SignInButton } from '../../features/auth/ui/sign-in-button'
import { UserMenu } from '../../features/auth/ui/user-menu'
import { ThemeToggle } from '../../components/theme-toggle'
import { NotificationCenter } from '../../features/notification'

export function Header() {
  const { data: session, isPending: loading } = useSession()

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">Raktamarga</h1>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {loading ? (
            <IconLoader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : session?.user ? (
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <UserMenu session={session as Session} />
            </div>
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </header>
  )
}
