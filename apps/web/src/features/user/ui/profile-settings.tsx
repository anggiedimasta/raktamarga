import { useState, useEffect } from 'react'
import { IconLoader2, IconCircleCheck } from '@tabler/icons-react'
import { toast } from 'sonner'
import { trpc } from '../../../shared/lib/trpc-react'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'

export function ProfileSettings() {
  const { data: user, isLoading } = trpc.user.me.useQuery()
  const utils = trpc.useUtils()

  const [formData, setFormData] = useState({
    name: '',
    image: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        image: user.image || '',
      })
    }
  }, [user])

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      utils.user.me.invalidate()
      toast.success('Profil berhasil diperbarui')
    },
    onError: (err) => {
      toast.error('Gagal memperbarui profil', { description: err.message })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Profil Saya</CardTitle>
        <CardDescription>Perbarui informasi profil Anda.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col items-center sm:flex-row gap-6 pb-4">
              <Avatar className="h-24 w-24 border-2 border-primary/10">
                <AvatarImage src={formData.image} alt={formData.name} />
                <AvatarFallback className="text-xl font-semibold bg-primary/5 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 text-center sm:text-left">
                <Label className="text-base">Foto Profil</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="URL Foto Profil"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="max-w-xs"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Gunakan URL gambar publik untuk sementara (mendukung Gravatar/pimage URL).
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama lengkap Anda"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-muted/50 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Email tidak dapat diubah karena terikat dengan akun Anda.
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              <IconCircleCheck className="mr-2 h-4 w-4" />
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
