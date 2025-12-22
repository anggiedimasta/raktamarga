import { useSearch } from '@tanstack/react-router'
import { Header } from '../shared/ui'
import { Card, CardContent } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { IconBell, IconUser } from '@tabler/icons-react'
import { NotificationSettings } from '../features/user/ui/notification-settings'
import { ProfileSettings } from '../features/user/ui/profile-settings'

export function SettingsPage() {
  const search = useSearch({ strict: false }) as any
  const defaultTab = search.tab || 'notifications'
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Pengaturan</h1>

        <div className="max-w-4xl">
          <Tabs defaultValue={defaultTab} className="flex flex-col md:flex-row gap-8">
            <TabsList className="flex md:flex-col h-auto bg-transparent p-0 gap-2 md:w-64">
              <TabsTrigger
                value="profile"
                className="justify-start px-4 py-3 h-auto data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20"
              >
                <IconUser size={18} className="mr-3" />
                Profil Saya
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="justify-start px-4 py-3 h-auto data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20"
              >
                <IconBell size={18} className="mr-3" />
                Notifikasi
              </TabsTrigger>
            </TabsList>

            <div className="flex-1">
              <TabsContent value="profile" className="mt-0">
                <Card className="border-primary/10">
                  <CardContent className="pt-6">
                    <ProfileSettings />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <Card className="border-primary/10">
                  <CardContent className="pt-6">
                    <NotificationSettings />
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
