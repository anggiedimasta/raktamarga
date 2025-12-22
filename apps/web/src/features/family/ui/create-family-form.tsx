import { useState } from 'react'
import { IconLoader2 } from '@tabler/icons-react'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { Alert, AlertDescription } from '../../../components/ui/alert'
import { trpc } from '../../../shared/lib/trpc-react'

interface CreateFamilyFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function CreateFamilyForm({ onSuccess, onCancel }: CreateFamilyFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [familyCode, setFamilyCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const utils = trpc.useUtils()
  const createFamily = trpc.family.create.useMutation({
    onSuccess: (data) => {
      utils.family.list.invalidate()
      setName('')
      setDescription('')
      setFamilyCode('')
      setError(null)
      toast.success('Keluarga berhasil dibuat!', {
        description: `Keluarga "${data.name}" telah dibuat dengan kode ${data.familyCode}`,
      })
      onSuccess?.()
    },
    onError: (err) => {
      setError(err.message)
      toast.error('Gagal membuat keluarga', {
        description: err.message,
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Nama keluarga harus diisi')
      return
    }

    createFamily.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      familyCode: familyCode.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Keluarga *</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Keluarga Besar Ahmad"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi (Opsional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deskripsi singkat tentang keluarga..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="familyCode">Kode Keluarga (Opsional)</Label>
        <Input
          id="familyCode"
          type="text"
          value={familyCode}
          onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
          placeholder="Min 6 karakter"
          minLength={6}
          maxLength={12}
          className="font-mono tracking-wider"
        />
        <p className="text-xs text-muted-foreground">
          Biarkan kosong untuk menghasilkan kode otomatis
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={createFamily.isPending} className="flex-1">
          {createFamily.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
          {createFamily.isPending ? 'Membuat...' : 'Buat Keluarga'}
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
