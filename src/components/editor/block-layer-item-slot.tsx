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
import { isPage } from '@/api'

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
      try {
        validateSlotMax({ source, target: target.data })
        validateSlotBlock({ source, target: target.data })
      } catch (e) {
        if (e instanceof Error) toast.error(e.message, { richColors: true })
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

export function validateSlotMax<S extends { data: any }>(args: {
  source?: S
  target: {
    parent: ComponentProps<typeof BlockLayerItem>['parent']
  }
}) {
  let error = undefined
  if (isPage(args.target.parent.node)) return error

  const maxItems = config[args.target.parent.node.type].slots?.[args.target.parent.slot].validation?.maxItems
  const itemsLength = args.target.parent.node.slots[args.target.parent.slot].length
  if (maxItems) {
    if (args.source && isDragData['block'](args.source.data)) {
      if (args.source.data.parent.slot !== args.target.parent.slot || args.source.data.parent.node.id !== args.target.parent.node.id) {
        if (itemsLength >= maxItems) {
          throw new Error(`This slot cannot have more than ${maxItems} items`)
        }
      }
    } else {
      if (itemsLength >= maxItems) {
        throw new Error(`This slot cannot have more than ${maxItems} items`)
      }
    }
  }
}

export function validateSlotBlock<S extends { data: any }>(args: {
  source: S
  target: {
    parent: ComponentProps<typeof BlockLayerItem>['parent']
  }
}) {
  let error = undefined
  if (isPage(args.target.parent.node)) return error

  const disabledComponents = config[args.target.parent.node.type].slots?.[args.target.parent.slot].validation?.disabledComponents

  if (disabledComponents) {
    if (isDragData['component'](args.source.data)) {
      if (disabledComponents.includes(args.source.data.type)) {
        throw new Error(`${args.source.data.type} cannot be dropped here`)
      }
    }
    if (isDragData['block'](args.source.data)) {
      if (disabledComponents.includes(args.source.data.node.type)) {
        throw new Error(`${args.source.data.node.type} cannot be dropped here`)
      }
    }
    if (isDragData['template'](args.source.data)) {
      if (disabledComponents.includes(args.source.data.node.rootNode.type)) {
        throw new Error(`${args.source.data.node.rootNode.type} cannot be dropped here`)
      }
    }
  }
}
