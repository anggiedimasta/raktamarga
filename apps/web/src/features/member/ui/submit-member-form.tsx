import { useState } from 'react'
import { IconLoader2 } from '@tabler/icons-react'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Alert, AlertDescription } from '../../../components/ui/alert'
import { trpc } from '../../../shared/lib/trpc-react'

interface SubmitMemberFormProps {
  familyId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function SubmitMemberForm({ familyId, onSuccess, onCancel }: SubmitMemberFormProps) {
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('')
  const [error, setError] = useState<string | null>(null)

  const submitMember = trpc.member.submit.useMutation({
    onSuccess: () => {
      toast.success('Usulan dikirim!', {
        description: 'Usulan penambahan anggota telah dikirim ke admin keluarga untuk disetujui.',
      })
      onSuccess?.()
    },
    onError: (err) => {
      setError(err.message)
      toast.error('Gagal mengirim usulan', {
        description: err.message,
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Nama harus diisi')
      return
    }

    submitMember.mutate({
      familyId,
      submissionType: 'create',
      memberData: {
        name: name.trim(),
        dob: dob || null,
        gender: gender || null,
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Lengkap *</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Budi Santoso"
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
          <Select
            value={gender}
            onValueChange={(value: 'male' | 'female' | 'other') => setGender(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Laki-laki</SelectItem>
              <SelectItem value="female">Perempuan</SelectItem>
              <SelectItem value="other">Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitMember.isPending} className="flex-1">
          {submitMember.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitMember.isPending ? 'Mengirim...' : 'Kirim Usulan'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
        )}
      </div>
    </form>
  )
}
