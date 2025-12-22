import { useState } from 'react'
import { IconCalendar, IconUser, IconEdit, IconRelationManyToMany, IconHistory, IconX } from '@tabler/icons-react'
import { trpc } from '../../../shared/lib/trpc-react'
import { useSession } from '../../../shared/lib/auth'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { RelationshipList } from '../../relationship/ui/relationship-list'
import { AddRelationshipForm } from '../../relationship/ui/add-relationship-form'
import { AddEventForm, TimelineView } from '../../event'
import { EditMemberForm } from './edit-member-form'

interface MemberProfileProps {
  memberId: string
  isAdmin?: boolean
}

export function MemberProfile({ memberId, isAdmin = false }: MemberProfileProps) {
  const { data: session } = useSession()
  const [showAddRelation, setShowAddRelation] = useState(false)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { data: member, isLoading } = trpc.member.getById.useQuery({ id: memberId })

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Memuat data anggota...</div>
  }

  if (!member) {
    return <div className="p-8 text-center text-muted-foreground">Anggota tidak ditemukan.</div>
  }

  const isCreator = member.createdBy === session?.user?.id

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          {isEditing ? (
            <div className="bg-card border rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Edit Profil Anggota</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                  <IconX size={20} />
                </Button>
              </div>
              <EditMemberForm
                member={member}
                isAdmin={isAdmin}
                isCreator={isCreator}
                onSuccess={() => setIsEditing(false)}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-32 h-32 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground overflow-hidden flex-shrink-0">
                {member.profilePhoto ? (
                  <img src={member.profilePhoto} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <IconUser size={64} />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold">{member.name}</h1>
                  <Badge variant="outline" className="capitalize">
                    {member.gender === 'male' ? 'Laki-laki' : member.gender === 'female' ? 'Perempuan' : member.gender || 'Tidak ditentukan'}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-muted-foreground">
                  {member.dob && (
                    <div className="flex items-center gap-1 text-sm">
                      <IconCalendar size={16} />
                      <span>Lahir: {new Date(member.dob).toLocaleDateString('id-ID')}</span>
                    </div>
                  )}
                  {member.dod && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <IconCalendar size={16} />
                      <span>Wafat: {new Date(member.dod).toLocaleDateString('id-ID')}</span>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setIsEditing(true)}>
                  <IconEdit size={16} className="mr-2" />
                  {isAdmin || isCreator ? 'Edit Profil' : 'Usulkan Perubahan'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="relationships" className="w-full">
        <TabsList>
          <TabsTrigger value="relationships" className="flex items-center gap-2">
            <IconRelationManyToMany size={18} />
            Hubungan Keluarga
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <IconHistory size={18} />
            Garis Waktu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="relationships" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Hubungan Keluarga</h2>
            <Button size="sm" onClick={() => setShowAddRelation(true)}>
              Tambah Hubungan
            </Button>
          </div>

          {showAddRelation && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="text-lg">Tambah Hubungan Baru</CardTitle>
                <CardDescription>
                  Hubungkan {member.name} dengan anggota keluarga lainnya.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddRelationshipForm
                  memberId={memberId}
                  familyId={member.familyId}
                  onSuccess={() => setShowAddRelation(false)}
                  onCancel={() => setShowAddRelation(false)}
                />
              </CardContent>
            </Card>
          )}

          <RelationshipList memberId={memberId} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Garis Waktu Peristiwa</h2>
            {(isAdmin || isCreator) && (
              <Button size="sm" onClick={() => setShowAddEvent(true)}>
                Tambah Peristiwa
              </Button>
            )}
          </div>

          {showAddEvent && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="text-lg">Tambah Peristiwa Baru</CardTitle>
                <CardDescription>
                  Catat momen penting dalam hidup {member.name}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddEventForm
                  memberId={memberId}
                  onSuccess={() => setShowAddEvent(false)}
                  onCancel={() => setShowAddEvent(false)}
                />
              </CardContent>
            </Card>
          )}

          <TimelineView memberId={memberId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
