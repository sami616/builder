import { type Block } from '@/db'
import { useRouteContext } from '@tanstack/react-router'
import { type ComponentProps, Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { isDragData } from '@/hooks/use-drag'
import { useDrop } from '@/hooks/use-drop'
import { useBlockAdd } from '@/hooks/use-block-add'
import { useTemplateApply } from '@/hooks/use-template-apply'
import { BlockLayerItem } from '@/components/editor/block-layer-item'
import { useBlockMove } from '@/hooks/use-block-move'
import { validateComponentSlots } from '@/components/editor/block-item'
import { Missing } from '@/components/editor/missing'
import { CircleDashed } from 'lucide-react'
import { TreeItem } from '@/components/ui/tree'
import { Active } from '@/routes/pages.$id'

export function BlockLayerItemSlot(props: {
  block: Block
  slot: string
  parent: ComponentProps<typeof BlockLayerItem>['parent']
  hoveredBlockId?: Block['id']
  setHoveredBlockId: Dispatch<SetStateAction<Block['id'] | undefined>>
  setActive: Active['Set']
  active?: Active['State']
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
    <TreeItem
      htmlProps={{ 'data-component': 'BlockLayerItemSlot' }}
      collapsible={hasSlotEntries ? { open, setOpen } : undefined}
      drop={{ ref: ref, isDraggingOver }}
      icon={!hasSlotEntries ? CircleDashed : undefined}
      label={context.config[props.block.type].slots?.[props.slot].name}
    >
      {props.block.slots[props.slot].map((blockId, index) => (
        <BlockLayerItem
          setActive={props.setActive}
          active={props.active}
          hoveredBlockId={props.hoveredBlockId}
          setHoveredBlockId={props.setHoveredBlockId}
          index={index}
          parent={{ slot: props.slot, node: props.block }}
          blockId={blockId}
          key={blockId}
        />
      ))}
    </TreeItem>
  )
}
