import { Link } from '@tanstack/react-router'
import { IconChevronRight } from '@tabler/icons-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface Family {
  id: string
  name: string
  description: string | null
  familyCode: string
  adminId: string
  createdAt: Date | string
  updatedAt: Date | string
  memberCount?: number
}

interface FamilyCardProps {
  family: Family
  isAdmin?: boolean
}

export function FamilyCard({ family, isAdmin }: FamilyCardProps) {
  return (
    <Link to="/families/$familyId" params={{ familyId: family.id }}>
      <Card className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer group">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl group-hover:text-primary transition-colors">{family.name}</CardTitle>
              {family.description && (
                <CardDescription className="mt-1 line-clamp-2">
                  {family.description}
                </CardDescription>
              )}
            </div>
            <IconChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono tracking-wider">
              {family.familyCode.toUpperCase()}
            </Badge>
            {family.memberCount !== undefined && (
              <Badge variant="outline" className="bg-primary/5">
                {family.memberCount} Anggota
              </Badge>
            )}
            {isAdmin && (
              <Badge variant="default" className="ml-auto">Admin</Badge>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 pt-3 border-t">
            Keluarga sejak {format(new Date(family.createdAt), 'MMMM yyyy', { locale: id })}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
