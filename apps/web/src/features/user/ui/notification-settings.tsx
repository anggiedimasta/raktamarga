import { useState, useEffect } from 'react'
import { IconLoader2, IconCircleCheck } from '@tabler/icons-react'
import { toast } from 'sonner'
import { trpc } from '../../../shared/lib/trpc-react'
import { Switch } from '../../../components/ui/switch'
import { Label } from '../../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'

export function NotificationSettings() {
  const { data: user, isLoading } = trpc.user.me.useQuery()
  const utils = trpc.useUtils()

  const [settings, setSettings] = useState({
    notifications: {
      emailDigest: true,
      pushEnabled: true,
      mentionOnly: false,
    },
    language: 'id' as const,
  })

  useEffect(() => {
    if (user?.settings) {
      setSettings(user.settings as any)
    }
  }, [user])

  const updateSettings = trpc.user.updateSettings.useMutation({
    onSuccess: () => {
      utils.user.me.invalidate()
      toast.success('Pengaturan berhasil disimpan')
    },
    onError: (err) => {
      toast.error('Gagal menyimpan pengaturan', { description: err.message })
    },
  })

  const handleToggle = (key: keyof typeof settings.notifications) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key],
      },
    }
    setSettings(newSettings)
  }

  const handleSave = () => {
    updateSettings.mutate(settings)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Notifikasi</CardTitle>
        <CardDescription>Kelola bagaimana Anda menerima pemberitahuan dari Raktamarga.</CardDescription>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        <div className="flex items-center justify-between py-4 border-b">
          <div className="space-y-0.5">
            <Label className="text-base">Email Ringkasan</Label>
            <p className="text-sm text-muted-foreground">Kirim ringkasan aktivitas keluarga ke email saya.</p>
          </div>
          <Switch
            checked={settings.notifications.emailDigest}
            onCheckedChange={() => handleToggle('emailDigest')}
          />
        </div>

        <div className="flex items-center justify-between py-4 border-b">
          <div className="space-y-0.5">
            <Label className="text-base">Notifikasi Browser</Label>
            <p className="text-sm text-muted-foreground">Terima notifikasi langsung di peramban Anda.</p>
          </div>
          <Switch
            checked={settings.notifications.pushEnabled}
            onCheckedChange={() => handleToggle('pushEnabled')}
          />
        </div>

        <div className="flex items-center justify-between py-4 border-b">
          <div className="space-y-0.5">
            <Label className="text-base">Hanya Mention</Label>
            <p className="text-sm text-muted-foreground">Hanya beritahu jika ada yang menyebutkan Anda.</p>
          </div>
          <Switch
            checked={settings.notifications.mentionOnly}
            onCheckedChange={() => handleToggle('mentionOnly')}
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            <IconCircleCheck className="mr-2 h-4 w-4" />
            Simpan Perubahan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
