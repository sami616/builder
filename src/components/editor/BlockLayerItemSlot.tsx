import { type Block } from '@/db'
import { useRouteContext } from '@tanstack/react-router'
import { type ComponentProps, useRef } from 'react'
import { isDragData } from '@/hooks/useDrag'
import { useDrop } from '@/hooks/useDrop'
import { useBlockAdd } from '@/hooks/useBlockAdd'
import { useTemplateApply } from '@/hooks/useTemplateApply'
import { BlockLayerItem } from '@/components/editor/BlockLayerItem'
import { useBlockMove } from '@/hooks/useBlockMove'
import { validateComponentSlots } from '@/components/editor/BlockItem'
import { Missing } from './Missing'
import { Tree } from '../ui/tree'
import { ChevronUp, ChevronRight, ChevronDown, Folder, FolderClosed, FolderOpen, FolderPlus } from 'lucide-react'

export function BlockLayerItemSlot(props: {
  block: Block
  slot: string
  parent: ComponentProps<typeof BlockLayerItem>['parent']
  hoveredBlockId?: Block['id']
  setHoveredBlockId: (id: Block['id'] | undefined) => void
  setActiveBlockId: (id: Block['id'] | undefined) => void
  activeBlockId?: Block['id']
}) {
  const ref = useRef<HTMLDetailsElement>(null)
  const { blockMove } = useBlockMove()
  const { blockAdd } = useBlockAdd()
  const { templateApply } = useTemplateApply()

  const { isDraggingOver } = useDrop({
    dropRef: ref,
    data: { parent: { slot: props.slot, node: props.block } },
    disableDrop: ({ source, element }) => {
      try {
        validateComponentSlots({ source, element, node: props.block, slot: props.slot })
      } catch (e) {
        return true
      }
    },
    onDrop: ({ source, target }) => {
      if (isDragData['component'](source.data)) {
        blockAdd.mutate({ source: source.data, target: target.data })
      }
      if (isDragData['template'](source.data)) {
        templateApply.mutate({ source: source.data, target: target.data })
      }
      if (isDragData['block'](source.data)) {
        blockMove.mutate({ source: source.data, target: target.data })
      }
    },
  })

  const context = useRouteContext({ from: '/pages/$id' })

  const hasSlotEntries = props.block.slots[props.slot].length > 0

  if (!context.config[props.block.type]?.slots?.[props.slot]) return <Missing node={{ type: 'slot', name: props.slot }} />

  return (
    <Tree
      openIcon={<ChevronDown className="size-4 opacity-40 group-hover:opacity-100" />}
      closedIcon={<ChevronRight className="size-4 opacity-40 group-hover:opacity-100" />}
      summaryProps={{ className: `group ${isDraggingOver ? 'bg-slate-100' : ''}` }}
      detailsProps={{ open: hasSlotEntries }}
      detailsRef={ref}
      label={context.config[props.block.type].slots?.[props.slot].name}
    >
      <>
        {props.block.slots[props.slot].map((blockId, index) => (
          <BlockLayerItem
            setActiveBlockId={props.setActiveBlockId}
            activeBlockId={props.activeBlockId}
            hoveredBlockId={props.hoveredBlockId}
            setHoveredBlockId={props.setHoveredBlockId}
            index={index}
            parent={{ slot: props.slot, node: props.block }}
            blockId={blockId}
            key={blockId}
          />
        ))}
      </>
    </Tree>
  )
}
