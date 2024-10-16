import { type Block } from '@/db'
import { config } from '@/main'
import { useRouteContext } from '@tanstack/react-router'
import { type ComponentProps, useRef, useState } from 'react'
import { isDragData } from '@/hooks/use-drag'
import { useDrop } from '@/hooks/use-drop'
import { useBlockAdd } from '@/hooks/use-block-add'
import { useTemplateApply } from '@/hooks/use-template-apply'
import { BlockLayerItem } from '@/components/editor/block-layer-item'
import { useBlockMove } from '@/hooks/use-block-move'
import { Missing } from '@/components/editor/missing'
import { CircleDashed } from 'lucide-react'
import { TreeItem, TreeItemContent, TreeItemHead, TreeItemIcon, TreeItemLabel, TreeItemTrigger } from '@/components/ui/tree'
import clsx from 'clsx'
import { toast } from 'sonner'

export function BlockLayerItemSlot(props: { block: Block; slot: string; parent: ComponentProps<typeof BlockLayerItem>['parent'] }) {
  const dropRef = useRef<HTMLDivElement>(null)
  const { blockMove } = useBlockMove()
  const { blockAdd } = useBlockAdd()
  const { templateApply } = useTemplateApply()
  const [open, setOpen] = useState(false)

  const { isDraggingOver } = useDrop({
    dropRef,
    data: { parent: { slot: props.slot, node: props.block } },
    onDrop: ({ source, target }) => {
      let error = undefined
      error = validateComponentSlots({ source, node: props.block, slot: props.slot })
      if (error) {
        toast.error(error)
        return
      }
      if (isDragData['component'](source.data)) {
        blockAdd({ source: source.data, target: target.data })
      }
      if (isDragData['template'](source.data)) {
        templateApply({ source: source.data, target: target.data })
      }
      if (isDragData['block'](source.data)) {
        blockMove({ source: source.data, target: target.data })
      }
      setOpen(true)
    },
  })

  const context = useRouteContext({ from: '/pages/$id' })
  const slotLength = props.block.slots[props.slot].length
  const hasSlotEntries = slotLength > 0

  if (!context.config[props.block.type]?.slots?.[props.slot]) return <Missing node={{ type: 'slot', name: props.slot }} />

  return (
    <TreeItem
      htmlProps={{
        className: clsx([isDraggingOver && 'ring-inset ring-2 ring-rose-500', 'py-0']),
      }}
      open={open}
      setOpen={setOpen}
    >
      <TreeItemHead customRef={dropRef}>
        <TreeItemTrigger hide={!hasSlotEntries} />
        <TreeItemIcon hide={hasSlotEntries} icon={CircleDashed} />
        <TreeItemLabel label={context.config[props.block.type].slots?.[props.slot].name} />
      </TreeItemHead>
      <TreeItemContent>
        {props.block.slots[props.slot].map((blockId, index) => (
          <BlockLayerItem index={index} parent={{ slot: props.slot, node: props.block }} blockId={blockId} key={blockId} />
        ))}
      </TreeItemContent>
    </TreeItem>
  )
}

export function validateComponentSlots(args: { source: Record<string, any>; node: Block; slot: string }) {
  const disabledComponents = config[args.node.type].slots?.[args.slot].validation?.disabledComponents
  const maxItems = config[args.node.type].slots?.[args.slot].validation?.maxItems
  const itemsLength = args.node.slots[args.slot].length

  if (maxItems) {
    if (itemsLength >= maxItems) {
      return `This slot cannot have more than ${maxItems} items`
    }
  }
  if (disabledComponents) {
    if (isDragData['component'](args.source.data)) {
      if (disabledComponents.includes(args.source.data.type)) {
        return `${args.source.data.type} cannot be dropped here`
      }
    }
    if (isDragData['block'](args.source.data)) {
      if (disabledComponents.includes(args.source.data.node.type)) {
        return `${args.source.data.node.type} cannot be dropped here`
      }
    }
    if (isDragData['template'](args.source.data)) {
      if (disabledComponents.includes(args.source.data.node.rootNode.type)) {
        return `${args.source.data.node.rootNode.type} cannot be dropped here`
      }
    }
  }
}
