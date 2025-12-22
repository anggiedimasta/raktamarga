import { useState } from 'react'
import { IconLoader2 } from '@tabler/icons-react'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Alert, AlertDescription } from '../../../components/ui/alert'
import { trpc } from '../../../shared/lib/trpc-react'

interface EditMemberFormProps {
  member: any
  isAdmin: boolean
  isCreator: boolean
  onSuccess?: () => void
  onCancel?: () => void
}

export function EditMemberForm({ member, isAdmin, isCreator, onSuccess, onCancel }: EditMemberFormProps) {
  const [name, setName] = useState(member.name || '')
  const [dob, setDob] = useState(member.dob || '')
  const [dod, setDod] = useState(member.dod || '')
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>(member.gender || '')
  const [visibilityLevel, setVisibilityLevel] = useState(member.privacySettings?.visibilityLevel || 'family_only')
  const [error, setError] = useState<string | null>(null)

  const utils = trpc.useUtils()

  const canDirectUpdate = isAdmin || isCreator

  const updateMember = trpc.member.update.useMutation({
    onSuccess: () => {
      utils.member.getById.invalidate({ id: member.id })
      toast.success('Profil berhasil diperbarui')
      onSuccess?.()
    },
    onError: (err) => {
      setError(err.message)
      toast.error('Gagal memperbarui profil', { description: err.message })
    },
  })

  const submitUpdate = trpc.member.submit.useMutation({
    onSuccess: () => {
      toast.success('Usulan perubahan dikirim', {
        description: 'Perubahan Anda telah dikirim ke admin keluarga untuk disetujui.',
      })
      onSuccess?.()
    },
    onError: (err) => {
      setError(err.message)
      toast.error('Gagal mengirim usulan', { description: err.message })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Nama harus diisi')
      return
    }

    const memberData = {
      name: name.trim(),
      dob: dob || null,
      dod: dod || null,
      gender: gender || null,
      privacySettings: {
        visibilityLevel,
        customRules: member.privacySettings?.customRules || {},
      },
    }

    if (canDirectUpdate) {
      updateMember.mutate({
        id: member.id,
        ...memberData,
      })
    } else {
      submitUpdate.mutate({
        familyId: member.familyId,
        submissionType: 'update',
        memberId: member.id,
        memberData,
      })
    }
  }

  const isPending = updateMember.isPending || submitUpdate.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!canDirectUpdate && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertDescription className="text-amber-800 text-xs">
            Anda bukan admin atau pembuat data ini. Perubahan yang Anda lakukan akan dikirim sebagai usulan kepada admin.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nama Lengkap *</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dob">Tanggal Lahir</Label>
          <Input
            id="dob"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Jenis Kelamin</Label>
          <Select value={gender} onValueChange={(value: any) => setGender(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Laki-laki</SelectItem>
              <SelectItem value="female">Perempuan</SelectItem>
              <SelectItem value="other">Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dod">Tanggal Wafat (Kosongkan jika masih hidup)</Label>
        <Input
          id="dod"
          type="date"
          value={dod}
          onChange={(e) => setDod(e.target.value)}
        />
      </div>

      <div className="space-y-2 pt-2 border-t mt-4">
        <Label htmlFor="visibility">Pengaturan Privasi</Label>
        <Select value={visibilityLevel} onValueChange={(value: any) => setVisibilityLevel(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Publik (Bisa dilihat siapa saja)</SelectItem>
            <SelectItem value="family_only">Hanya Keluarga (Hanya anggota keluarga)</SelectItem>
            <SelectItem value="private">Privat (Hanya Anda dan Admin)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-[10px] text-muted-foreground italic">
          * Admin keluarga tetap dapat melihat profil untuk verifikasi data.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
          {canDirectUpdate ? 'Simpan Perubahan' : 'Kirim Usulan Perubahan'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Batal
        </Button>
      </div>
    </form>
  )
}
