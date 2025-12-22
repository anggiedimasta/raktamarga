import { useState } from 'react'
import { IconLoader2, IconTrash, IconArrowsExchange, IconSettings, IconLink } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/button'
import { ConnectFamilyForm } from './connect-family-form'
import { PendingConnections } from './pending-connections'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert'
import { trpc } from '../../../shared/lib/trpc-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'

interface FamilySettingsProps {
  family: any
}

export function FamilySettings({ family }: FamilySettingsProps) {
  const navigate = useNavigate()
  const [name, setName] = useState(family.name || '')
  const [description, setDescription] = useState(family.description || '')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false)
  const [newAdminId, setNewAdminId] = useState<string | null>(null)

  const utils = trpc.useUtils()
  const { data: members } = trpc.family.getMembers.useQuery({ familyId: family.id })

  const updateFamily = trpc.family.update.useMutation({
    onSuccess: () => {
      utils.family.getById.invalidate({ id: family.id })
      toast.success('Pengaturan keluarga diperbarui')
    },
    onError: (err) => {
      toast.error('Gagal memperbarui pengaturan', { description: err.message })
    },
  })

  const deleteFamily = trpc.family.delete.useMutation({
    onSuccess: () => {
      toast.success('Keluarga berhasil dihapus')
      navigate({ to: '/' })
    },
    onError: (err) => {
      toast.error('Gagal menghapus keluarga', { description: err.message })
    },
  })

  const transferAdmin = trpc.family.transferAdmin.useMutation({
    onSuccess: () => {
      utils.family.getById.invalidate({ id: family.id })
      toast.success('Admin keluarga berhasil dipindahkan')
      setIsTransferDialogOpen(false)
    },
    onError: (err) => {
      toast.error('Gagal memindahkan admin', { description: err.message })
    },
  })

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    updateFamily.mutate({
      id: family.id,
      name,
      description: description || null,
    })
  }

  const otherMembers = members?.filter(m => m.userId && m.userId !== family.adminId) || []

  return (
    <div className="space-y-8">
      {/* General Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <IconSettings size={20} />
          Pengaturan Umum
        </h3>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Keluarga</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan sedikit tentang keluarga ini..."
              rows={3}
            />
          </div>
          <Button type="submit" disabled={updateFamily.isPending}>
            {updateFamily.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </form>
      </div>

      <div className="border-t pt-8 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <IconArrowsExchange size={20} />
          Manajemen Admin
        </h3>
        <p className="text-sm text-muted-foreground">
          Pindahkan hak akses admin kepada anggota keluarga lain yang sudah terhubung dengan akun pengguna.
        </p>

        <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Pindahkan Admin</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pindahkan Hak Admin</DialogTitle>
              <DialogDescription>
                Pilih anggota keluarga yang akan menjadi admin baru. Setelah dipindahkan, Anda akan kehilangan hak akses admin untuk keluarga ini.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="new-admin">Pilih Admin Baru</Label>
              <Select value={newAdminId} onValueChange={setNewAdminId}>
                <SelectTrigger id="new-admin">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {otherMembers.length > 0 ? (
                    otherMembers.map((m) => (
                      <SelectItem key={m.userId || ''} value={m.userId || ''}>
                        {m.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Tidak ada anggota lain yang terhubung dengan akun.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>Batal</Button>
              <Button
                variant="default"
                disabled={!newAdminId || transferAdmin.isPending}
                onClick={() => newAdminId && transferAdmin.mutate({ familyId: family.id, newAdminId })}
              >
                {transferAdmin.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                Pindahkan Sekarang
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border-t pt-8 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <IconLink size={20} />
          Koneksi Keluarga
        </h3>
        <p className="text-sm text-muted-foreground">
          Hubungkan silsilah keluarga Anda dengan keluarga lain untuk memperluas jaringan warisan.
        </p>

        <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Hubungkan Keluarga</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Hubungkan dengan Keluarga Lain</DialogTitle>
              <DialogDescription>
                Gunakan kode keluarga target untuk memulai proses penyambungan silsilah.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <ConnectFamilyForm
                currentFamilyId={family.id}
                onSuccess={() => setIsConnectDialogOpen(false)}
                onCancel={() => setIsConnectDialogOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>

        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Permintaan Koneksi Pending</h4>
          <PendingConnections familyId={family.id} />
        </div>
      </div>

      <div className="border-t pt-8 space-y-4">
        <h3 className="text-lg font-semibold text-destructive flex items-center gap-2">
          <IconTrash size={20} />
          Zona Bahaya
        </h3>
        <Alert variant="destructive">
          <AlertTitle>Hapus Keluarga</AlertTitle>
          <AlertDescription>
            Menghapus keluarga akan menghapus semua data anggota, hubungan, dan riwayat secara permanen. Tindakan ini tidak dapat dibatalkan.
          </AlertDescription>
        </Alert>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">Hapus Keluarga Ini</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apakah Anda yakin?</DialogTitle>
              <DialogDescription>
                Tindakan ini akan menghapus keluarga "{family.name}" secara permanen beserta seluruh datanya.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
              <Button
                variant="destructive"
                disabled={deleteFamily.isPending}
                onClick={() => deleteFamily.mutate({ id: family.id })}
              >
                {deleteFamily.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ya, Hapus Permanen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
