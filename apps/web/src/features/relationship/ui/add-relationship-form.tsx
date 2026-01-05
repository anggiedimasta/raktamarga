import { useState } from 'react'
import { IconLoader2, IconSearch } from '@tabler/icons-react'
import { trpc } from '../../../shared/lib/trpc-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { toast } from 'sonner'
import { Badge } from '../../../components/ui/badge'

interface AddRelationshipFormProps {
  memberId: string
  familyId: string
  onSuccess?: () => void
  onCancel?: () => void
}

const relationshipTypes = [
  { value: 'parent', label: 'Orang Tua' },
  { value: 'child', label: 'Anak' },
  { value: 'sibling', label: 'Saudara Kandung' },
  { value: 'spouse', label: 'Suami/Istri' },
  { value: 'partner', label: 'Pasangan' },
  { value: 'adoption', label: 'Anak Angkat' },
  { value: 'step_sibling', label: 'Saudara Tiri' },
]

export function AddRelationshipForm({ memberId, familyId, onSuccess, onCancel }: AddRelationshipFormProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [relationshipType, setRelationshipType] = useState<string>('')

  const utils = trpc.useUtils()
  const { data: familyMembers, isLoading: loadingMembers } = trpc.member.list.useQuery({ familyId })

  const createRelationship = trpc.relationship.create.useMutation({
    onSuccess: () => {
      utils.relationship.list.invalidate({ memberId })
      toast.success('Hubungan keluarga berhasil ditambahkan')
      onSuccess?.()
    },
    onError: (err) => {
      toast.error('Gagal menambahkan hubungan', { description: err.message })
    },
  })

  const filteredMembers = familyMembers?.filter(m =>
    m.id !== memberId &&
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMemberId || !relationshipType) {
      toast.error('Mohon pilih anggota keluarga dan jenis hubungan')
      return
    }

    createRelationship.mutate({
      member1Id: memberId,
      member2Id: selectedMemberId,
      relationshipType: relationshipType as 'parent' | 'child' | 'sibling' | 'spouse' | 'partner' | 'adoption' | 'step_sibling',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Cari Anggota Keluarga</Label>
        <div className="relative">
          <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ketik nama anggota..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="max-h-40 overflow-y-auto border rounded-md p-1 space-y-1">
          {loadingMembers ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Memuat anggota...</div>
          ) : filteredMembers.length > 0 ? (
            filteredMembers.map(m => (
              <button
                key={m.id}
                type="button"
                className={`w-full text-left p-2 rounded text-sm transition-colors ${
                  selectedMemberId === m.id ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                }`}
                onClick={() => setSelectedMemberId(m.id)}
              >
                <div className="flex justify-between items-center">
                  <span>{m.name}</span>
                  {selectedMemberId === m.id && <Badge variant="secondary" className="text-[10px]">Dipilih</Badge>}
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">Tidak ada anggota lain ditemukan.</div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rel-type">Jenis Hubungan</Label>
        <Select value={relationshipType} onValueChange={(val) => setRelationshipType(val ?? '')}>
          <SelectTrigger id="rel-type">
            <SelectValue placeholder="Pilih jenis hubungan..." />
          </SelectTrigger>
          <SelectContent>
            {relationshipTypes.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[10px] text-muted-foreground">
          Catatan: Hubungan ini mendefinisikan hubungan anggota yang Anda cari terhadap profil saat ini.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          className="flex-1"
          disabled={createRelationship.isPending || !selectedMemberId || !relationshipType}
        >
          {createRelationship.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Hubungan
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </form>
  )
}
