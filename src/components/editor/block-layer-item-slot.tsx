import { type Block } from '@/db'
import { useRouteContext } from '@tanstack/react-router'
import { type ComponentProps, Dispatch, SetStateAction, useRef, useState } from 'react'
import { isDragData } from '@/hooks/use-drag'
import { useDrop } from '@/hooks/use-drop'
import { useBlockAdd } from '@/hooks/use-block-add'
import { useTemplateApply } from '@/hooks/use-template-apply'
import { BlockLayerItem } from '@/components/editor/block-layer-item'
import { useBlockMove } from '@/hooks/use-block-move'
import { validateComponentSlots } from '@/components/editor/block-item'
import { Missing } from '@/components/editor/missing'
import { CircleDashed } from 'lucide-react'
import { Fold, FoldContent, FoldHead, FoldIcon, FoldLabel, FoldTrigger } from '@/components/ui/tree'
import clsx from 'clsx'

export function BlockLayerItemSlot(props: {
  block: Block
  slot: string
  parent: ComponentProps<typeof BlockLayerItem>['parent']
  hoveredBlockId?: Block['id']
  setHoveredBlockId: Dispatch<SetStateAction<Block['id'] | undefined>>
}) {
  const dropRef = useRef<HTMLDivElement>(null)
  const { blockMove } = useBlockMove()
  const { blockAdd } = useBlockAdd()
  const { templateApply } = useTemplateApply()
  const [open, setOpen] = useState(false)

  const { isDraggingOver } = useDrop({
    dropRef,
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
      setOpen(true)
    },
  })

  const context = useRouteContext({ from: '/pages/$id' })
  const slotLength = props.block.slots[props.slot].length
  const hasSlotEntries = slotLength > 0

  if (!context.config[props.block.type]?.slots?.[props.slot]) return <Missing node={{ type: 'slot', name: props.slot }} />

  return (
    <Fold
      htmlProps={{
        className: clsx([isDraggingOver && 'ring-inset ring-2 ring-rose-500']),
      }}
      open={open}
      setOpen={setOpen}
    >
      <FoldHead customRef={dropRef}>
        <FoldTrigger hide={!hasSlotEntries} />
        <FoldIcon hide={hasSlotEntries} icon={CircleDashed} />
        <FoldLabel label={context.config[props.block.type].slots?.[props.slot].name} />
      </FoldHead>
      <FoldContent>
        {props.block.slots[props.slot].map((blockId, index) => (
          <BlockLayerItem
            hoveredBlockId={props.hoveredBlockId}
            setHoveredBlockId={props.setHoveredBlockId}
            index={index}
            parent={{ slot: props.slot, node: props.block }}
            blockId={blockId}
            key={blockId}
          />
        ))}
      </FoldContent>
    </Fold>
  )
}
