import { useParams, Link } from '@tanstack/react-router'
import { IconArrowLeft } from '@tabler/icons-react'
import { MemberProfile } from '@/features/member/ui/member-profile'
import { Button } from '@/components/ui/button'
import { useSession } from '@/shared/lib/auth'
import { trpc } from '@/shared/lib/trpc-react'

import { Header } from '@/shared/ui'



export function MemberDetailPage() {
  const { familyId, memberId } = useParams({ from: '/families/$familyId/members/$memberId' })
  const { data: session } = useSession()
  const { data: family } = trpc.family.getById.useQuery({ id: familyId })

  const isAdmin = family?.adminId === session?.user?.id

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <header className="mb-8">
          <Button variant="ghost" asChild className="-ml-4 mb-4">
            <Link to="/families/$familyId" params={{ familyId }}>
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Keluarga
            </Link>
          </Button>
        </header>

        <MemberProfile memberId={memberId} isAdmin={isAdmin} />
      </div>
    </div>
  )
}
