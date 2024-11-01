import { type Page, type Block } from '@/db'
import { useRef, useState } from 'react'
import { useDrag, isDragData } from '@/hooks/use-drag'
import { useDrop } from '@/hooks/use-drop'
import { useBlockUpdateName } from '@/hooks/use-block-update-name'
import { useBlockGet } from '@/hooks/use-block-get'
import { useTemplateApply } from '@/hooks/use-template-apply'
import { BlockLayerItemSlot, validateSlotBlock, validateSlotMax } from '@/components/editor/block-layer-item-slot'
import { useBlockAdd } from '@/hooks/use-block-add'
import { useBlockMove } from '@/hooks/use-block-move'
import { AlertCircle } from 'lucide-react'
import { TreeItem, TreeItemContent, TreeItemHead, TreeItemLabel, TreeItemTrigger } from '@/components/ui/tree'
import { DropIndicator } from './drop-indicator'
import { DragPreview } from './drag-preview'
import clsx from 'clsx'
import { BlockLayerItemActions } from '@/components/editor/block-layer-item-actions'
import { useActive } from '@/hooks/use-active'
import { toast } from 'sonner'
import { useRouteContext } from '@tanstack/react-router'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { flash } from '@/lib/utils'
import { useBlockHover } from '@/hooks/use-block-hover'

export function BlockLayerItem(props: { id: Block['id']; index: number; parent: { slot: string; node: Block | Page } }) {
  const { isActive, handleActiveClick } = useActive()
  const dragRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLLIElement>(null)
  const { blockGet } = useBlockGet({ id: props.id })
  const { blockUpdateName } = useBlockUpdateName()
  const { blockMove } = useBlockMove()
  const { blockAdd } = useBlockAdd()
  const { templateApply } = useTemplateApply()
  const [actionsOpen, setActionsOpen] = useState(false)
  const isActiveBlock = isActive({ ...blockGet.data, meta: { index: props.index, parent: props.parent } })
  const isLeaf = Object.keys(blockGet.data.slots).length === 0
  const context = useRouteContext({ from: '/pages/$id' })
  const [open, setOpen] = useState(false)
  const { setHover, removeHover } = useBlockHover(props.id, dropRef)

  const { isDraggingSource, dragPreviewContainer } = useDrag({
    dragRef,
    data: { id: 'block', parent: props.parent, node: blockGet.data, index: props.index },
  })

  const { closestEdge } = useDrop({
    dropRef,
    data: { parent: props.parent, node: blockGet.data, index: props.index },
    onLongDrag: (element) => {
      if (open || isLeaf) return
      flash(element)
      setOpen(true)
    },
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
    },
  })

  const isMissing = context.config[blockGet.data.type] ? false : true

  return (
    <TreeItem
      open={open}
      setOpen={setOpen}
      customRef={dropRef}
      htmlProps={{
        'data-drop-id': `block-${blockGet.data.id}`,
        className: clsx([
          'outline',
          'outline-2',
          '-outline-offset-2',
          'outline-none',
          isDraggingSource && 'opacity-50',
          isActiveBlock && 'outline-rose-500 hover:outline-rose-600',
        ]),
        onClick: (e) => {
          e.stopPropagation()
          handleActiveClick({ metaKey: e.metaKey, node: { ...blockGet.data, meta: { index: props.index, parent: props.parent } } })
        },
        onMouseOver: (e) => {
          e.stopPropagation()
          if (actionsOpen) return
          setHover()
        },
        onMouseOut: (e) => {
          e.stopPropagation()
          if (actionsOpen) return
          removeHover()
        },
      }}
    >
      <TreeItemHead customRef={dragRef}>
        <TreeItemTrigger hide={isLeaf} />
        {/* <TreeItemIcon icon={Layers2} /> */}
        <TreeItemLabel
          label={blockGet.data.name}
          onRename={(updatedName) => {
            blockUpdateName({ block: blockGet.data, name: updatedName })
          }}
        />
        {isMissing && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <AlertCircle size={16} className="text-red-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{blockGet.data.type} not found</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <BlockLayerItemActions
          actionsOpen={actionsOpen}
          setActionsOpen={setActionsOpen}
          block={blockGet.data}
          index={props.index}
          parent={props.parent}
        />
      </TreeItemHead>
      <TreeItemContent>
        {Object.keys(blockGet.data.slots).map((slot) => (
          <BlockLayerItemSlot key={slot} slot={slot} block={blockGet.data} parent={props.parent} />
        ))}
      </TreeItemContent>
      <DropIndicator closestEdge={closestEdge} variant="horizontal" />
      <DragPreview dragPreviewContainer={dragPreviewContainer}>{blockGet.data.name}</DragPreview>
    </TreeItem>
  )
}
