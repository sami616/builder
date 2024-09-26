import { type Block } from '../db'
import { useRouteContext } from '@tanstack/react-router'
import { type ComponentProps, useRef } from 'react'
import { isDragData } from '../utils/useDrag'
import { useDrop } from '../utils/useDrop'
import { useBlockAdd } from '../utils/useBlockAdd'
import { useTemplateApply } from '../utils/useTemplateApply'
import { BlockLayerItem } from './BlockLayerItem'
import { useBlockMove } from '../utils/useBlockMove'
import { validateComponentSlots } from './BlockItem'

export function BlockLayerItemSlot(props: {
  block: Block
  slot: string
  parent: ComponentProps<typeof BlockLayerItem>['parent']
  hoveredBlockId?: Block['id']
  setHoveredBlockId: (id: Block['id'] | undefined) => void
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

  return (
    <details open={hasSlotEntries} style={{ outline: isDraggingOver ? '2px solid red' : 'none' }} ref={ref}>
      <summary>{context.config[props.block.type].slots?.[props.slot].name}</summary>
      <ul>
        {props.block.slots[props.slot].map((blockId, index) => (
          <BlockLayerItem
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
    </details>
  )
}
