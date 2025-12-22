import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react'
import { useTheme } from './theme-provider'
import { Button } from './ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={`Current: ${theme}. Click to toggle.`}
    >
      {theme === 'light' && <IconSun className="h-5 w-5" />}
      {theme === 'dark' && <IconMoon className="h-5 w-5" />}
      {theme === 'system' && <IconDeviceDesktop className="h-5 w-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
