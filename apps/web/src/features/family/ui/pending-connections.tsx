import { IconLoader2, IconCircleCheck, IconCircleX, IconLink } from '@tabler/icons-react'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { trpc } from '../../../shared/lib/trpc-react'
import { Card, CardContent } from '../../../components/ui/card'
import { cn } from '@/lib/utils'

interface PendingConnectionsProps {
  familyId: string
}

export function PendingConnections({ familyId }: PendingConnectionsProps) {
  const utils = trpc.useUtils()

  const { data: connections, isLoading } = trpc.connection.list.useQuery({
    familyId
  })

  const approveConnection = trpc.connection.approve.useMutation({
    onSuccess: () => {
      utils.connection.list.invalidate({ familyId })
      toast.success('Koneksi disetujui')
    },
    onError: (err) => {
      toast.error('Gagal menyetujui koneksi', { description: err.message })
    },
  })

  const rejectConnection = trpc.connection.reject.useMutation({
    onSuccess: () => {
      utils.connection.list.invalidate({ familyId })
      toast.success('Koneksi ditolak')
    },
    onError: (err) => {
      toast.error('Gagal menolak koneksi', { description: err.message })
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const actionRequired = connections?.filter(c =>
    (c.family1Id === familyId && !c.approvedByFamily1Admin && c.status === 'pending') ||
    (c.family2Id === familyId && !c.approvedByFamily2Admin && c.status === 'pending')
  ) || []

  const waitingForOther = connections?.filter(c =>
    (c.family1Id === familyId && c.approvedByFamily1Admin && !c.approvedByFamily2Admin && c.status === 'pending') ||
    (c.family2Id === familyId && c.approvedByFamily2Admin && !c.approvedByFamily1Admin && c.status === 'pending')
  ) || []

  if (actionRequired.length === 0 && waitingForOther.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
        <IconLink className="mx-auto h-8 w-8 mb-2 opacity-20" />
        <p className="text-sm">Tidak ada permintaan koneksi tertunda.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {actionRequired.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Perlu Persetujuan Anda</h5>
          {actionRequired.map((conn: any) => (
            <ConnectionCard
              key={conn.id}
              conn={conn}
              familyId={familyId}
              onApprove={() => approveConnection.mutate({ id: conn.id })}
              onReject={() => rejectConnection.mutate({ id: conn.id })}
              isPending={approveConnection.isPending || rejectConnection.isPending}
              type="action"
            />
          ))}
        </div>
      )}

      {waitingForOther.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Menunggu Persetujuan Keluarga Lain</h5>
          {waitingForOther.map((conn: any) => (
            <ConnectionCard
              key={conn.id}
              conn={conn}
              familyId={familyId}
              type="waiting"
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ConnectionCard({ conn, familyId, onApprove, onReject, isPending, type }: any) {
  const otherFamilyName = conn.family1Id === familyId ? conn.family2Name : conn.family1Name

  return (
    <Card className={cn(
      "overflow-hidden transition-all",
      type === 'action' ? "border-primary/30 shadow-sm" : "border-border/50 opacity-80"
    )}>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              type === 'action' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              <IconLink size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-sm">
                Koneksi dengan <span className="text-primary">{otherFamilyName}</span>
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Melalui anggota: <span className="font-medium text-foreground">{conn.connectingMember?.name || 'Seseorang'}</span>
              </p>
            </div>
          </div>

          {type === 'action' ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="default"
                className="h-8 text-[11px] bg-green-600 hover:bg-green-700"
                onClick={onApprove}
                disabled={isPending}
              >
                <IconCircleCheck size={14} className="mr-1" />
                Setujui
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-[11px] text-destructive hover:bg-destructive/10"
                onClick={onReject}
                disabled={isPending}
              >
                <IconCircleX size={14} className="mr-1" />
                Tolak
              </Button>
            </div>
          ) : (
            <Badge variant="outline" className="text-[10px] font-normal py-0 h-6">
              Sedang diproses...
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
