import { useMemo, useState, useEffect } from 'react'
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  Background,
  Controls,
  Panel,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import dagre from 'dagre'
import '@xyflow/react/dist/style.css'
import { trpc } from '../../../shared/lib/trpc-react'
import { IconLoader2, IconLayoutGrid, IconSearch } from '@tabler/icons-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { MemberNode } from './member-node'

const nodeTypes = {
  member: MemberNode,
}

const dagreGraph = new dagre.graphlib.Graph()
dagreGraph.setDefaultEdgeLabel(() => ({}))

const nodeWidth = 180
const nodeHeight = 80

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({ rankdir: direction })

  for (const node of nodes) {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  }

  for (const edge of edges) {
    dagreGraph.setEdge(edge.source, edge.target)
  }

  dagre.layout(dagreGraph)

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    }
  })

  return { nodes: newNodes, edges }
}

interface FamilyTreeProps {
  familyId: string
}

function FamilyTreeInner({ familyId }: FamilyTreeProps) {
  const [includeConnected, setIncludeConnected] = useState(false)
  const { data: members, isLoading: membersLoading } = trpc.family.getMembers.useQuery({
    familyId,
    includeConnected
  })
  const { data: relationships, isLoading: relsLoading } = trpc.relationship.list.useQuery({
    familyId,
    includeConnected
  })
  const { setCenter } = useReactFlow()
  const [searchTerm, setSearchTerm] = useState('')

  const initialElements = useMemo(() => {
    if (!members || !relationships) return { nodes: [], edges: [] }

    const nodes = members.map((member) => ({
      id: member.id,
      type: 'member',
      data: {
        member,
        isExternal: member.familyId !== familyId,
      },
      position: { x: 0, y: 0 },
    }))

    const edges = relationships
      .filter(rel => rel.relationshipType === 'parent' || rel.relationshipType === 'child')
      .map((rel) => {
        // Standardize: parent -> child
        const source = rel.relationshipType === 'parent' ? rel.member1Id : rel.member2Id
        const target = rel.relationshipType === 'parent' ? rel.member2Id : rel.member1Id

        return {
          id: rel.id,
          source,
          target,
          type: ConnectionLineType.SmoothStep,
          animated: !rel.verified,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#64748b',
          },
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        }
      })

    return getLayoutedElements(nodes, edges)
  }, [members, relationships, familyId])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialElements.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialElements.edges)

  // Update nodes and edges when initialElements change
  useEffect(() => {
    setNodes(initialElements.nodes)
    setEdges(initialElements.edges)
  }, [initialElements, setNodes, setEdges])

  // Handle search highlighting
  useEffect(() => {
    if (!searchTerm) {
      setNodes((nds) => nds.map((node) => ({ ...node, selected: false })))
      return
    }

    setNodes((nds) =>
      nds.map((node) => {
        const member = (node.data as any).member
        const matches = member.name.toLowerCase().includes(searchTerm.toLowerCase())
        return {
          ...node,
          selected: matches,
        }
      })
    )
  }, [searchTerm, setNodes])

  const onLayout = (direction: string) => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      direction
    )
    setNodes([...layoutedNodes])
    setEdges([...layoutedEdges])
  }

  const zoomToMember = (id: string) => {
    const node = nodes.find((n) => n.id === id)
    if (node) {
      setCenter(node.position.x + nodeWidth / 2, node.position.y + nodeHeight / 2, {
        zoom: 1.5,
        duration: 800,
      })
    }
  }

  if (membersLoading || relsLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center border rounded-lg bg-background">
        <div className="flex flex-col items-center gap-2">
          <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Menyiapkan visualisasi silsilah...</p>
        </div>
      </div>
    )
  }

  const searchResults = searchTerm
    ? members?.filter((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : []

  return (
    <div className="h-[600px] border rounded-lg overflow-hidden bg-muted/20 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
      >
        <Background gap={20} size={1} />
        <Controls />
        <Panel position="top-left" className="flex flex-col gap-2 w-64">
          <div className="relative">
            <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari anggota..."
              className="pl-9 bg-background shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {searchTerm && searchResults && searchResults.length > 0 && (
            <div className="bg-background border rounded-md shadow-lg max-h-48 overflow-auto animate-in fade-in slide-in-from-top-1">
              {searchResults.map((m) => (
                <button
                  key={m.id}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between group"
                  onClick={() => zoomToMember(m.id)}
                >
                  <span className="truncate">{m.name}</span>
                  <span className="text-[10px] text-muted-foreground group-hover:text-primary">Zoom</span>
                </button>
              ))}
            </div>
          )}
        </Panel>
        <Panel position="top-right" className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onLayout('TB')} className="bg-background shadow-sm">
              <IconLayoutGrid size={16} className="mr-2" />
              Vertikal
            </Button>
            <Button variant="outline" size="sm" onClick={() => onLayout('LR')} className="bg-background shadow-sm">
              <IconLayoutGrid size={16} className="mr-2 rotate-90" />
              Horizontal
            </Button>
          </div>
          <Button
            variant={includeConnected ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIncludeConnected(!includeConnected)}
            className="shadow-sm"
          >
            {includeConnected ? 'Sembunyikan Keluarga Terhubung' : 'Tampilkan Keluarga Terhubung'}
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  )
}

export function FamilyTree(props: FamilyTreeProps) {
  return (
    <ReactFlowProvider>
      <FamilyTreeInner {...props} />
    </ReactFlowProvider>
  )
}
