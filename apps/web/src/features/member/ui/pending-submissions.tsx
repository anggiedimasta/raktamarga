import { IconCheck, IconX, IconLoader2, IconCalendar, IconUser } from '@tabler/icons-react'
import { toast } from 'sonner'
import { trpc } from '../../../shared/lib/trpc-react'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'

interface PendingSubmissionsProps {
  familyId: string
}

export function PendingSubmissions({ familyId }: PendingSubmissionsProps) {
  const utils = trpc.useUtils()
  const { data: submissions, isLoading } = trpc.member.getSubmissions.useQuery({ familyId })

  const approve = trpc.member.approveSubmission.useMutation({
    onSuccess: () => {
      utils.member.getSubmissions.invalidate({ familyId })
      utils.family.getMembers.invalidate({ familyId })
      toast.success('Usulan disetujui')
    },
    onError: (err) => {
      toast.error('Gagal menyetujui usulan', { description: err.message })
    },
  })

  const reject = trpc.member.rejectSubmission.useMutation({
    onSuccess: () => {
      utils.member.getSubmissions.invalidate({ familyId })
      toast.success('Usulan ditolak')
    },
    onError: (err) => {
      toast.error('Gagal menolak usulan', { description: err.message })
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
        <p>Tidak ada usulan data anggota yang tertunda.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => {
        const memberData = submission.memberData as {
          name: string
          dob?: string
          gender?: 'male' | 'female' | 'other'
        }
        return (
          <Card key={submission.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={submission.submissionType === 'create' ? 'default' : 'secondary'}>
                      {submission.submissionType === 'create' ? 'Anggota Baru' : 'Perubahan Data'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{memberData.name}</CardTitle>
                  <CardDescription>
                    Diusulkan oleh User ID: {submission.submittedBy}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    disabled={approve.isPending || reject.isPending}
                    onClick={() => reject.mutate({ submissionId: submission.id })}
                  >
                    <IconX className="h-4 w-4 mr-1" />
                    Tolak
                  </Button>
                  <Button
                    size="sm"
                    disabled={approve.isPending || reject.isPending}
                    onClick={() => approve.mutate({ submissionId: submission.id })}
                  >
                    <IconCheck className="h-4 w-4 mr-1" />
                    Setujui
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {memberData.dob && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IconCalendar className="h-4 w-4" />
                    <span>Lahir: {new Date(memberData.dob).toLocaleDateString('id-ID')}</span>
                  </div>
                )}
                {memberData.gender && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IconUser className="h-4 w-4" />
                    <span className="capitalize">{memberData.gender === 'male' ? 'Laki-laki' : memberData.gender === 'female' ? 'Perempuan' : 'Lainnya'}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
