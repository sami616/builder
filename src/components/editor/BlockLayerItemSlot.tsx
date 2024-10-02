import { type Block } from '@/db'
import { useRouteContext } from '@tanstack/react-router'
import { type ComponentProps, Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { isDragData } from '@/hooks/useDrag'
import { useDrop } from '@/hooks/useDrop'
import { useBlockAdd } from '@/hooks/useBlockAdd'
import { useTemplateApply } from '@/hooks/useTemplateApply'
import { BlockLayerItem } from '@/components/editor/BlockLayerItem'
import { useBlockMove } from '@/hooks/useBlockMove'
import { validateComponentSlots } from '@/components/editor/BlockItem'
import { Missing } from './Missing'
import { ChevronRight, ChevronDown, CircleDashed } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'

export function BlockLayerItemSlot(props: {
  block: Block
  slot: string
  parent: ComponentProps<typeof BlockLayerItem>['parent']
  hoveredBlockId?: Block['id']
  setHoveredBlockId: Dispatch<SetStateAction<Block['id'] | undefined>>
  setActiveBlockId: Dispatch<SetStateAction<Block['id'] | undefined>>
  activeBlockId?: Block['id']
}) {
  const ref = useRef<HTMLLIElement>(null)
  const { blockMove } = useBlockMove()
  const { blockAdd } = useBlockAdd()
  const { templateApply } = useTemplateApply()
  const [open, setOpen] = useState(false)

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

  const slotLength = props.block.slots[props.slot].length
  const hasSlotEntries = slotLength > 0

  useEffect(() => {
    if (hasSlotEntries) setOpen(true)
  }, [hasSlotEntries])

  if (!context.config[props.block.type]?.slots?.[props.slot]) return <Missing node={{ type: 'slot', name: props.slot }} />

  return (
    <Collapsible asChild open={open} onOpenChange={setOpen}>
      <li ref={ref} className={['select-none', 'grid', 'gap-2', 'p-2', 'text-sm', isDraggingOver && 'bg-gray-100'].join(' ')}>
        <CollapsibleTrigger asChild>
          <div className="group w-full flex gap-2 items-center cursor-pointer">
            {open ? (
              <ChevronDown size={16} className="opacity-40 group-hover:opacity-100" />
            ) : (
              <ChevronRight size={16} className="opacity-40 group-hover:opacity-100" />
            )}
            <CircleDashed size={14} className={['opacity-40'].join(' ')} /> {context.config[props.block.type].slots?.[props.slot].name}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent asChild>
          {hasSlotEntries && (
            <ul className="pl-2 ml-2 border-l border-dashed">
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
            </ul>
          )}
        </CollapsibleContent>
      </li>
    </Collapsible>
  )
}
