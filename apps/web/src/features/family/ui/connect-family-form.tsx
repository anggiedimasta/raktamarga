import { useState } from 'react'
import { IconLoader2, IconSearch, IconLink } from '@tabler/icons-react'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert'
import { trpc } from '../../../shared/lib/trpc-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { Card, CardContent } from '../../../components/ui/card'

interface ConnectFamilyFormProps {
  currentFamilyId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ConnectFamilyForm({ currentFamilyId, onSuccess, onCancel }: ConnectFamilyFormProps) {
  const [code, setCode] = useState('')
  const [targetFamily, setTargetFamily] = useState<any>(null)
  const [connectingMemberId, setConnectingMemberId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: members } = trpc.family.getMembers.useQuery({
    familyId: currentFamilyId
  })

  const findFamily = trpc.family.getByCode.useQuery(
    { code: code.trim() },
    {
      enabled: false,
      retry: false,
    }
  )

  const createConnection = trpc.connection.create.useMutation({
    onSuccess: () => {
      toast.success('Permintaan koneksi berhasil dikirim!', {
        description: 'Admin dari kedua keluarga harus menyetujui koneksi ini.',
      })
      onSuccess?.()
    },
    onError: (err) => {
      setError(err.message)
      toast.error('Gagal membuat koneksi', {
        description: err.message,
      })
    },
  })

  const handleSearch = async () => {
    if (!code.trim()) return
    setError(null)
    setTargetFamily(null)

    try {
      const result = await findFamily.refetch()
      if (result.data) {
        if (result.data.id === currentFamilyId) {
          setError('Anda tidak dapat menghubungkan keluarga dengan dirinya sendiri')
          return
        }
        setTargetFamily(result.data)
      } else {
        setError('Keluarga dengan kode tersebut tidak ditemukan')
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetFamily || !connectingMemberId) return

    createConnection.mutate({
      family1Id: currentFamilyId,
      family2Id: targetFamily.id,
      connectingMemberId,
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="target-code">Kode Keluarga Target</Label>
          <div className="flex gap-2">
            <Input
              id="target-code"
              placeholder="MASUKKAN KODE"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-mono tracking-wider"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleSearch}
              disabled={findFamily.isFetching || !code.trim()}
            >
              {findFamily.isFetching ? <IconLoader2 className="animate-spin" size={18} /> : <IconSearch size={18} />}
              <span className="ml-2">Cari</span>
            </Button>
          </div>
        </div>

        {targetFamily && (
          <Card className="bg-muted/50 border-primary/20 animate-in fade-in slide-in-from-top-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-lg">{targetFamily.name}</h4>
                  <p className="text-sm text-muted-foreground">{targetFamily.description || 'Tidak ada deskripsi'}</p>
                </div>
                <div className="text-primary">
                  <IconLink size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {targetFamily && (
          <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-4">
            <div className="space-y-2">
              <Label htmlFor="connecting-member">Anggota Penghubung</Label>
              <Select value={connectingMemberId} onValueChange={setConnectingMemberId}>
                <SelectTrigger id="connecting-member">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {members?.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                Anggota penghubung adalah individu yang sama yang ada di kedua keluarga ini.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Kesalahan</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={createConnection.isPending || !connectingMemberId}
              >
                {createConnection.isPending ? (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <IconLink className="mr-2 h-4 w-4" />
                )}
                Kirim Permintaan Koneksi
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Batal
                </Button>
              )}
            </div>
          </form>
        )}

        {error && !targetFamily && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {!targetFamily && onCancel && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onCancel}>Tutup</Button>
        </div>
      )}
    </div>
  )
}
