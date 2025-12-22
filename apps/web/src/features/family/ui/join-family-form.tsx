import { useState } from 'react'
import { IconLoader2 } from '@tabler/icons-react'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Alert, AlertDescription } from '../../../components/ui/alert'
import { trpc } from '../../../shared/lib/trpc-react'

interface JoinFamilyFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function JoinFamilyForm({ onSuccess, onCancel }: JoinFamilyFormProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const utils = trpc.useUtils()
  const joinFamily = trpc.family.join.useMutation({
    onSuccess: (data) => {
      utils.family.list.invalidate()
      setCode('')
      setError(null)
      toast.success('Berhasil bergabung!', {
        description: `Anda telah bergabung dengan keluarga "${data.name}"`,
      })
      onSuccess?.()
    },
    onError: (err) => {
      setError(err.message)
      toast.error('Gagal bergabung', {
        description: err.message,
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!code.trim()) {
      setError('Kode keluarga harus diisi')
      return
    }

    joinFamily.mutate({
      code: code.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="code">Kode Keluarga *</Label>
        <Input
          id="code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="text-center text-lg font-mono tracking-wider"
          placeholder="MASUKKAN KODE"
          required
        />
        <p className="text-xs text-muted-foreground">
          Masukkan kode keluarga yang diberikan oleh admin keluarga
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={joinFamily.isPending} className="flex-1">
          {joinFamily.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
          {joinFamily.isPending ? 'Bergabung...' : 'Bergabung'}
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
