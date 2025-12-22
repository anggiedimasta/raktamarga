import { useState } from 'react'
import { IconLoader2 } from '@tabler/icons-react'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Alert, AlertDescription } from '../../../components/ui/alert'
import { trpc } from '../../../shared/lib/trpc-react'

interface AddEventFormProps {
  memberId: string
  onSuccess?: () => void
  onCancel?: () => void
}

const eventTypes = [
  { value: 'birth', label: 'Kelahiran' },
  { value: 'death', label: 'Kematian' },
  { value: 'marriage', label: 'Pernikahan' },
  { value: 'divorce', label: 'Perceraian' },
  { value: 'partnership', label: 'Pasangan' },
  { value: 'adoption', label: 'Adopsi' },
  { value: 'graduation', label: 'Kelulusan' },
  { value: 'migration', label: 'Pindah Domisili' },
  { value: 'custom', label: 'Lainnya' },
]

const privacyLevels = [
  { value: 'private', label: 'Privat (Hanya Saya)' },
  { value: 'family_only', label: 'Keluarga Inti' },
  { value: 'extended_family', label: 'Keluarga Besar' },
  { value: 'public', label: 'Publik' },
]

export function AddEventForm({ memberId, onSuccess, onCancel }: AddEventFormProps) {
  const [eventType, setEventType] = useState<string>('')
  const [eventDate, setEventDate] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [privacyLevel, setPrivacyLevel] = useState<string>('family_only')
  const [error, setError] = useState<string | null>(null)

  const utils = trpc.useUtils()
  const createEvent = trpc.event.create.useMutation({
    onSuccess: () => {
      utils.event.list.invalidate({ memberId })
      toast.success('Peristiwa berhasil ditambahkan')
      onSuccess?.()
    },
    onError: (err) => {
      setError(err.message)
      toast.error('Gagal menambahkan peristiwa', { description: err.message })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventType || !eventDate) {
      toast.error('Mohon isi jenis peristiwa dan tanggal')
      return
    }

    createEvent.mutate({
      memberId,
      eventType: eventType as any,
      eventDate,
      location: location || null,
      description: description || null,
      privacyLevel: privacyLevel as any,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="event-type">Jenis Peristiwa *</Label>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger id="event-type">
              <SelectValue placeholder="Pilih jenis..." />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-date">Tanggal *</Label>
          <Input
            id="event-date"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Lokasi</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Contoh: Jakarta, Indonesia"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tambahkan detail atau cerita..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="privacy">Privasi</Label>
        <Select value={privacyLevel} onValueChange={setPrivacyLevel}>
          <SelectTrigger id="privacy">
            <SelectValue placeholder="Pilih privasi..." />
          </SelectTrigger>
          <SelectContent>
            {privacyLevels.map(p => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          className="flex-1"
          disabled={createEvent.isPending || !eventType || !eventDate}
        >
          {createEvent.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Peristiwa
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </form>
  )
}
