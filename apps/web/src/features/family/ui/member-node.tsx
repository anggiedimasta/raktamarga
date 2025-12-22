import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { IconUser } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

export const MemberNode = memo(({ data }: NodeProps) => {
  const member = data.member as any
  const isExternal = (data as any).isExternal
  const isMale = member.gender === 'male'
  const isFemale = member.gender === 'female'

  return (
    <div className={cn(
      "px-4 py-3 shadow-md rounded-xl border-2 transition-all hover:shadow-lg",
      isMale ? "bg-blue-50/80 border-blue-200 text-blue-900" :
      isFemale ? "bg-rose-50/80 border-rose-200 text-rose-900" :
      "bg-slate-50/80 border-slate-200 text-slate-900",
      "backdrop-blur-sm",
      isExternal && "opacity-60 border-dashed"
    )}>
      <Handle type="target" position={data.targetPosition as Position} className="w-2 h-2 !bg-muted-foreground border-none" />

      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          isMale ? "bg-blue-100" : isFemale ? "bg-rose-100" : "bg-slate-100"
        )}>
          {member.profilePhoto ? (
            <img src={member.profilePhoto} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <IconUser size={20} className={cn(
              isMale ? "text-blue-600" : isFemale ? "text-rose-600" : "text-slate-600"
            )} />
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold truncate">{member.name}</span>
          <span className="text-[10px] opacity-70 truncate">
            {isMale ? 'Laki-laki' : isFemale ? 'Perempuan' : ''}
          </span>
        </div>
      </div>

      <Handle type="source" position={data.sourcePosition as Position} className="w-2 h-2 !bg-muted-foreground border-none" />
    </div>
  )
})

MemberNode.displayName = 'MemberNode'
