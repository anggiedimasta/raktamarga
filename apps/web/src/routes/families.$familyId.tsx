import { useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { IconArrowLeft, IconLoader2, IconCalendar, IconUser, IconPlus, IconClipboardList, IconSettings, IconGitBranch, IconHistory } from '@tabler/icons-react'
import { trpc } from '../shared/lib/trpc-react'
import { useSession } from '../shared/lib/auth'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { SubmitMemberForm, PendingSubmissions } from '../features/member'
import { FamilySettings, FamilyTree } from '../features/family'
import { TimelineView } from '../features/event'

import { Header } from '../shared/ui'

export function FamilyDetailPage() {
  const { familyId } = useParams({ from: '/families/$familyId' })
  const { data: session } = useSession()
  const [showAddMember, setShowAddMember] = useState(false)

  const { data: family, isLoading } = trpc.family.getById.useQuery({ id: familyId })
  const { data: members, isLoading: membersLoading } = trpc.family.getMembers.useQuery(
    { familyId },
    { enabled: !!family },
  )

  const isAdmin = family?.adminId === session?.user?.id

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!family) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardHeader className="text-center">
              <CardTitle>Keluarga tidak ditemukan</CardTitle>
              <CardDescription>
                Keluarga yang Anda cari tidak ditemukan atau Anda tidak memiliki akses.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link to="/">Kembali ke beranda</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" asChild className="-ml-4">
              <Link to="/">
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Link>
            </Button>
            <Button onClick={() => setShowAddMember(true)} size="sm">
              <IconPlus className="mr-2 h-4 w-4" />
              Usulkan Anggota
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">{family.name}</h1>
              {family.description && (
                <p className="text-xl text-muted-foreground max-w-3xl">{family.description}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="font-mono tracking-wider text-sm px-3 py-1">
                KODE: {family.familyCode.toUpperCase()}
              </Badge>
              {isAdmin && (
                <Badge variant="default" className="text-sm px-3 py-1">
                  Admin Keluarga
                </Badge>
              )}
            </div>
          </div>
        </header>

        {showAddMember && (
          <Card className="mb-8 border-primary/50">
            <CardHeader>
              <CardTitle>Usulkan Anggota Baru</CardTitle>
              <CardDescription>
                Usulkan penambahan anggota keluarga baru. Data ini akan divalidasi oleh admin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubmitMemberForm
                familyId={familyId}
                onSuccess={() => setShowAddMember(false)}
                onCancel={() => setShowAddMember(false)}
              />
            </CardContent>
          </Card>
        )}

        {/* Content Tabs */}
        <Tabs defaultValue="tree" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tree" className="flex items-center gap-2">
              <IconGitBranch className="h-4 w-4" />
              Silsilah
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <IconUser className="h-4 w-4" />
              Anggota
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <IconHistory className="h-4 w-4" />
              Garis Waktu
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="submissions" className="flex items-center gap-2">
                <IconClipboardList className="h-4 w-4" />
                Usulan
                <PendingSubmissionBadge familyId={familyId} />
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <IconSettings className="h-4 w-4" />
                Pengaturan
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="tree">
            <Card>
              <CardHeader>
                <CardTitle>Visualisasi Silsilah</CardTitle>
                <CardDescription>
                  Lihat hubungan antar anggota keluarga dalam bentuk pohon silsilah
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FamilyTree familyId={familyId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Anggota Keluarga</CardTitle>
                <CardDescription>
                  Daftar anggota keluarga yang terdaftar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {membersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : members && members.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map((member) => (
                      <Link
                        key={member.id}
                        to="/families/$familyId/members/$memberId"
                        params={{ familyId, memberId: member.id }}
                        className="block"
                      >
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                          <CardContent className="pt-6">
                            <h3 className="font-semibold mb-2">{member.name || 'Nama tidak tersedia'}</h3>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              {member.dob && (
                                <div className="flex items-center gap-2">
                                  <IconCalendar className="h-4 w-4" />
                                  <span>Lahir: {new Date(member.dob).toLocaleDateString('id-ID')}</span>
                                </div>
                              )}
                              {member.gender && (
                                <div className="flex items-center gap-2">
                                  <IconUser className="h-4 w-4" />
                                  <span className="capitalize">
                                    {member.gender === 'male'
                                      ? 'Laki-laki'
                                      : member.gender === 'female'
                                        ? 'Perempuan'
                                        : 'Lainnya'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Belum ada anggota keluarga.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Garis Waktu Keluarga</CardTitle>
                <CardDescription>
                  Kumpulan peristiwa penting dari seluruh anggota keluarga
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TimelineView familyId={familyId} />
              </CardContent>
            </Card>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="submissions">
              <Card>
                <CardHeader>
                  <CardTitle>Usulan Data Tertunda</CardTitle>
                  <CardDescription>
                    Validasi usulan penambahan atau perubahan data anggota keluarga
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PendingSubmissions familyId={familyId} />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Keluarga</CardTitle>
                  <CardDescription>
                    Kelola informasi keluarga, pemindahan admin, dan penghapusan data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FamilySettings family={family} />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

function PendingSubmissionBadge({ familyId }: { familyId: string }) {
  const { data: submissions } = trpc.member.getSubmissions.useQuery({ familyId })

  if (!submissions || submissions.length === 0) return null

  return (
    <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
      {submissions.length}
    </Badge>
  )
}
