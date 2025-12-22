import { useState } from 'react'
import { IconPlus, IconUsers, IconLoader2 } from '@tabler/icons-react'
import { useSession } from '../shared/lib/auth'
import { SignInButton } from '../features/auth/ui/sign-in-button'
import { CreateFamilyForm, JoinFamilyForm, FamilyCard } from '../features/family'
import { trpc } from '../shared/lib/trpc-react'
import { Button } from '../components/ui/button'
import { Header } from '../shared/ui'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'

export function HomePage() {
  const { data: session } = useSession()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)

  const { data: families, isLoading: familiesLoading } = trpc.family.list.useQuery(undefined, {
    enabled: !!session?.user,
  })

  const isAuthenticated = !!session?.user

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <Header />

      <div className="container mx-auto px-4 py-12 flex-1">
        {/* Main Content */}
        <main className="max-w-6xl mx-auto">
          {!isAuthenticated ? (
            <div className="py-12 md:py-24 space-y-12">
              <section className="text-center space-y-6">
                <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight">
                  Silsilah keluarga <br />
                  <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                    dalam genggaman.
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Bangun, hubungkan, dan lestarikan warisan keluarga Anda secara digital.
                  Mulai perjalanan silsilah Anda sekarang.
                </p>
                <div className="flex justify-center pt-4">
                  <SignInButton />
                </div>
              </section>

              <div className="grid md:grid-cols-3 gap-8 pt-12">
                {[
                  { title: 'Bangun Silsilah', desc: 'Visualisasikan garis keturunan Anda dengan pohon keluarga interaktif.' },
                  { title: 'Terhubung', desc: 'Hubungkan pohon keluarga Anda dengan keluarga lain untuk melengkapi gambaran besar.' },
                  { title: 'Lestarikan Anggota', desc: 'Simpan cerita, foto, dan momen penting dari setiap anggota keluarga.' }
                ].map((feature, i) => (
                  <Card key={i} className="bg-background/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
                      <CardDescription>{feature.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-8">
                <div>
                  <h2 className="text-4xl font-extrabold tracking-tight">Halo, {session?.user?.name?.split(' ')[0]}!</h2>
                  <p className="text-muted-foreground text-lg mt-1">Selamat datang kembali di Raktamarga.</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-6 justify-start gap-4 border-dashed hover:border-primary hover:bg-primary/5 transition-all"
                  onClick={() => {
                    setShowCreateForm(true)
                    setShowJoinForm(false)
                  }}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <IconPlus className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Buat Keluarga Baru</h3>
                    <p className="text-sm text-muted-foreground">Mulai membangun silsilah keluarga baru</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-6 justify-start gap-4 border-dashed hover:border-accent hover:bg-accent/5 transition-all"
                  onClick={() => {
                    setShowJoinForm(true)
                    setShowCreateForm(false)
                  }}
                >
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <IconUsers className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Bergabung dengan Keluarga</h3>
                    <p className="text-sm text-muted-foreground">Masuk menggunakan kode dari admin keluarga</p>
                  </div>
                </Button>
              </div>

              {/* Forms */}
              {(showCreateForm || showJoinForm) && (
                <Card className="border-primary/50 animate-in fade-in slide-in-from-top-4 duration-300">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      {showCreateForm ? 'Buat Keluarga Baru' : 'Bergabung dengan Keluarga'}
                      <Button variant="ghost" size="sm" onClick={() => { setShowCreateForm(false); setShowJoinForm(false); }}>
                        Tutup
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {showCreateForm && (
                      <CreateFamilyForm
                        onSuccess={() => setShowCreateForm(false)}
                        onCancel={() => setShowCreateForm(false)}
                      />
                    )}
                    {showJoinForm && (
                      <JoinFamilyForm
                        onSuccess={() => setShowJoinForm(false)}
                        onCancel={() => setShowJoinForm(false)}
                      />
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Families List */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <IconUsers size={24} />
                  Keluarga Saya
                </h3>
                {familiesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : families && families.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {families.map((family) => (
                      <FamilyCard
                        key={family.id}
                        family={family}
                        isAdmin={family.adminId === session?.user?.id}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed bg-transparent">
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <p className="mb-2">Anda belum bergabung dengan keluarga manapun.</p>
                      <p className="text-sm">Buat atau bergabung dengan keluarga untuk memulai silsilah Anda.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
