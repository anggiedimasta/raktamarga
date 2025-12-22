import { useState } from 'react'
import {
  IconMapPin,
  IconCalendar,
  IconLoader2,
  IconBriefcase,
  IconHeart,
  IconSchool,
  IconPlane,
  IconUserPlus,
  IconSearch,
  IconFilter
} from '@tabler/icons-react'
import { trpc } from '../../../shared/lib/trpc-react'
import { Input } from '../../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface TimelineViewProps {
  memberId?: string
  familyId?: string
}

const eventTypeIcons: Record<string, any> = {
  birth: IconUserPlus,
  death: IconBriefcase,
  marriage: IconHeart,
  divorce: IconHeart,
  partnership: IconHeart,
  adoption: IconUserPlus,
  graduation: IconSchool,
  migration: IconPlane,
  custom: IconCalendar,
}

const eventTypeLabels: Record<string, string> = {
  birth: 'Kelahiran',
  death: 'Kematian',
  marriage: 'Pernikahan',
  divorce: 'Perceraian',
  partnership: 'Pasangan',
  adoption: 'Adopsi',
  graduation: 'Kelulusan',
  migration: 'Pindah Domisili',
  custom: 'Peristiwa Lainnya',
}

export function TimelineView({ memberId, familyId }: TimelineViewProps) {
  const [eventType, setEventType] = useState<string>('all')
  const [location, setLocation] = useState('')

  const { data: events, isLoading } = trpc.event.list.useQuery({
    memberId,
    familyId,
    eventType: eventType === 'all' ? undefined : eventType,
    location: location || undefined
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-muted/30 rounded-xl border border-border/50 backdrop-blur-sm">
        <div className="flex-1 relative">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari lokasi..."
            className="pl-9 bg-background/50 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={eventType} onValueChange={(val) => setEventType(val || 'all')}>
            <SelectTrigger className="bg-background/50 border-none shadow-none focus:ring-1 focus:ring-primary/20">
              <div className="flex items-center gap-2">
                <IconFilter size={14} className="text-muted-foreground" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Peristiwa</SelectItem>
              {Object.entries(eventTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!events || events.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-muted/10 rounded-2xl border-2 border-dashed border-muted/30">
          <p className="text-sm">
            {location || eventType !== 'all'
              ? 'Tidak ditemukan peristiwa yang sesuai dengan filter Anda.'
              : 'Belum ada peristiwa yang tercatat dalam garis waktu ini.'}
          </p>
          {(location || eventType !== 'all') && (
            <button
              onClick={() => { setEventType('all'); setLocation('') }}
              className="mt-4 text-xs text-primary hover:underline font-medium"
            >
              Atur Ulang Filter
            </button>
          )}
        </div>
      ) : (
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border/60 before:to-transparent">
          {events.map((event) => {
            const Icon = eventTypeIcons[event.eventType] || IconCalendar
            return (
              <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-primary text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <Icon size={18} />
                </div>
                {/* Content */}
                <div className="w-[calc(100%-4rem)] md:w-[45%] p-4 rounded border border-slate-200 bg-white shadow">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-slate-900">{eventTypeLabels[event.eventType] || event.eventType}</div>
                    <time className="font-mono text-xs font-medium text-primary">
                      {format(new Date(event.eventDate), 'dd MMM yyyy', { locale: id })}
                    </time>
                  </div>
                  <div className="text-slate-500 text-sm mb-2">{event.description}</div>
                  {event.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <IconMapPin size={14} />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
