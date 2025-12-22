import { IconTrash, IconCheck, IconAlertTriangle } from '@tabler/icons-react'
import { trpc } from '../../../shared/lib/trpc-react'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { toast } from 'sonner'

interface RelationshipListProps {
  memberId: string
  isAdmin?: boolean
}

const relationshipTypeLabels: Record<string, string> = {
  parent: 'Orang Tua',
  child: 'Anak',
  sibling: 'Saudara Kandung',
  spouse: 'Suami/Istri',
  partner: 'Pasangan',
  adoption: 'Anak Angkat',
  step_sibling: 'Saudara Tiri',
}

export function RelationshipList({ memberId, isAdmin }: RelationshipListProps) {
  const utils = trpc.useUtils()
  const { data: relationships, isLoading } = trpc.relationship.list.useQuery({ memberId })

  const deleteRelationship = trpc.relationship.delete.useMutation({
    onSuccess: () => {
      utils.relationship.list.invalidate({ memberId })
      toast.success('Hubungan berhasil dihapus')
    },
    onError: (err) => {
      toast.error('Gagal menghapus hubungan', { description: err.message })
    },
  })

  const verifyRelationship = trpc.relationship.verify.useMutation({
    onSuccess: () => {
      utils.relationship.list.invalidate({ memberId })
      toast.success('Hubungan berhasil diverifikasi')
    },
    onError: (err) => {
      toast.error('Gagal memverifikasi hubungan', { description: err.message })
    },
  })

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Memuat hubungan...</div>
  }

  if (!relationships || relationships.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center text-muted-foreground">
          Belum ada hubungan keluarga yang tercatat.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {relationships.map((rel) => {
        const otherMemberId = rel.member1Id === memberId ? rel.member2Id : rel.member1Id
        return (
          <RelationshipItem
            key={rel.id}
            relationship={rel}
            otherMemberId={otherMemberId}
            isAdmin={isAdmin}
            onDelete={() => deleteRelationship.mutate({ id: rel.id })}
            onVerify={() => verifyRelationship.mutate({ id: rel.id })}
            isDeleting={deleteRelationship.isPending}
            isVerifying={verifyRelationship.isPending}
          />
        )
      })}
    </div>
  )
}

function RelationshipItem({
  relationship,
  otherMemberId,
  isAdmin,
  onDelete,
  onVerify,
  isDeleting,
  isVerifying,
}: {
  relationship: {
    id: string
    relationshipType: string
    verified: boolean
    member1Id: string
    member2Id: string
  }
  otherMemberId: string
  isAdmin?: boolean
  onDelete: () => void
  onVerify: () => void
  isDeleting: boolean
  isVerifying: boolean
}) {
  const { data: member } = trpc.member.getById.useQuery({ id: otherMemberId })

  if (!member) return null

  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground">
            <IconUser size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{member.name}</span>
              <Badge variant="secondary" className="text-xs">
                {relationshipTypeLabels[relationship.relationshipType] || relationship.relationshipType}
              </Badge>
              {!relationship.verified && (
                <Badge variant="outline" className="text-amber-500 border-amber-500 flex items-center gap-1">
                  <IconAlertTriangle size={12} />
                  Belum Verifikasi
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {member.gender === 'male' ? 'Laki-laki' : member.gender === 'female' ? 'Perempuan' : ''}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && !relationship.verified && (
            <Button size="icon" variant="ghost" className="text-green-600" onClick={onVerify} disabled={isVerifying}>
              <IconCheck size={18} />
            </Button>
          )}
          <Button size="icon" variant="ghost" className="text-destructive" onClick={onDelete} disabled={isDeleting}>
            <IconTrash size={18} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
