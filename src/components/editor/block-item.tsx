import { useDeferredValue, useRef, useState } from 'react'
import { useBlockHover } from '@/hooks/use-block-hover'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { DropIndicator } from '@/components/editor/drop-indicator'
import { type Block, type Page } from '@/db'
import { useRouteContext } from '@tanstack/react-router'
import { DragPreview } from '@/components/editor/drag-preview'
import { useDrag, isDragData } from '@/hooks/use-drag'
import { useTemplateApply } from '@/hooks/use-template-apply'
import { useBlockGet } from '@/hooks/use-block-get'
import { useBlockAdd } from '@/hooks/use-block-add'
import { useDrop } from '@/hooks/use-drop'
import { useBlockMove } from '@/hooks/use-block-move'
import { Missing } from '@/components/editor/missing'
import clsx from 'clsx'
import { useActive } from '@/hooks/use-active'
import { toast } from 'sonner'
import { validateSlotBlock, validateSlotMax } from './block-layer-item-slot'
import { Copy, Layout, Plus, Trash } from 'lucide-react'
import {
  ContextMenu,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { useBlockCopy } from '@/hooks/use-block-copy'
import { useBlockDelete } from '@/hooks/use-block-delete'
import { BlockDialogAdd } from './block-dialog-add'
import { BlockDialogAddTemplate } from './block-dialog-add-template'

const blockAddSchema = z.object({
  name: z.string(),
  edge: z.union([z.literal('top'), z.literal('bottom')]),
  component: z.string(),
})

export function BlockItem(props: { index: number; page: Page; parent: { slot: string; node: Block | Page }; id: Block['id'] }) {
  const { blockGet } = useBlockGet({ id: props.id })
  const block = blockGet.data
  const componentProps = block.props
  const { blockAdd } = useBlockAdd()
  const { blockMove } = useBlockMove()
  const { templateApply } = useTemplateApply()
  const { setActive, isActive, handleActiveClick } = useActive()
  const dropRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const context = useRouteContext({ from: '/pages/$id' })
  const isActiveBlock = isActive({ ...block, meta: { index: props.index, parent: props.parent } })
  const { blockCopy } = useBlockCopy()
  const { blockDelete } = useBlockDelete()
  const [actionsOpen, setActionsOpen] = useState(false)
  const [blockAddOpen, setBlockAddOpen] = useState(false)
  const [templateAddOpen, setTemplateAddOpen] = useState(false)

  const { setHover, removeHover } = useBlockHover(block.id, dropRef)

  const blockAddForm = useForm<z.infer<typeof blockAddSchema>>({
    resolver: zodResolver(blockAddSchema),
    defaultValues: { name: '', edge: 'bottom', component: '' },
  })

  const { closestEdge } = useDrop({
    dropRef: dropRef,
    data: { index: props.index, parent: props.parent, node: block },
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

  const { isDraggingSource, dragPreviewContainer } = useDrag({
    dragRef,
    data: { id: 'block', index: props.index, parent: props.parent, node: block },
  })

  const componentBlocks = Object.keys(block.slots).reduce<{
    [key: string]: JSX.Element[] | JSX.Element
  }>((acc, slot) => {
    acc[slot] = block.slots[slot].map((blockId, index) => {
      return <BlockItem index={index} parent={{ slot, node: block }} page={props.page} key={blockId} id={blockId} />
    })

    return acc
  }, {})

  const deferredComponentBlocks = useDeferredValue(componentBlocks)

  const isMissing = context.config[block.type] ? false : true
  const Component = context.config[block.type]?.component ?? (() => <Missing node={{ type: 'component', name: block.type }} />)

  function disableAdd() {
    try {
      validateSlotMax({ target: { parent: props.parent } })
      return false
    } catch (e) {
      return true
    }
  }

  return (
    <>
      <ContextMenu
        onOpenChange={(bool) => {
          setActionsOpen(bool)
          if (bool) {
            setActive([{ ...block, meta: { index: props.index, parent: props.parent } }])
          } else {
            setActive([])
          }
        }}
      >
        <ContextMenuTrigger asChild>
          <div
            data-component="BlockItem"
            className={clsx([
              'relative',
              'outline',
              'outline-2',
              '-outline-offset-2',
              'outline-none',
              isDraggingSource && 'opacity-50',
              isActiveBlock && 'outline-rose-500 hover:outline-rose-600',
            ])}
            data-drop-id={`block-${blockGet.data.id}`}
            onClick={(e) => {
              e.stopPropagation()
              handleActiveClick({ metaKey: e.metaKey, node: { ...block, meta: { index: props.index, parent: props.parent } } })
            }}
            onMouseOver={(e) => {
              e.stopPropagation()
              if (actionsOpen || templateAddOpen || blockAddOpen) return
              setHover()
            }}
            onMouseOut={(e) => {
              e.stopPropagation()
              if (actionsOpen || templateAddOpen || blockAddOpen) return
              removeHover()
            }}
            ref={dropRef}
          >
            <div ref={dragRef} className="group">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  blockAddForm.setValue('edge', 'top')
                  setBlockAddOpen(true)
                }}
                className={clsx([
                  'size-5',
                  'items-center',
                  'justify-center',
                  'origin-top',
                  'z-50',
                  'absolute',
                  'top-0',
                  '-ml-2.5',
                  'left-1/2',
                  'scale-50',
                  'transition',
                  'hover:scale-100',
                  'hidden',
                  'group-hover:flex',
                  isActiveBlock ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600',
                ])}
              >
                <Plus size={14} className="stroke-white" />
              </button>

              <Component {...componentProps} {...deferredComponentBlocks} />

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  blockAddForm.setValue('edge', 'bottom')
                  setBlockAddOpen(true)
                }}
                className={clsx([
                  'size-5',
                  'items-center',
                  'justify-center',
                  'absolute',
                  'bottom-0',
                  'z-50',
                  'left-1/2',
                  'origin-bottom',
                  '-ml-2.5',
                  'scale-50',
                  'transition',
                  'hover:scale-100',
                  'hidden',
                  'group-hover:flex',
                  isActiveBlock ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600',
                ])}
              >
                <Plus size={14} className="stroke-white" />
              </button>
              <DropIndicator closestEdge={closestEdge} variant="horizontal" />
              <DragPreview dragPreviewContainer={dragPreviewContainer}>{block.name}</DragPreview>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent
          onClick={(e) => e.stopPropagation()}
          onMouseOut={(e) => e.stopPropagation()}
          onMouseOver={(e) => e.stopPropagation()}
          className="w-56"
        >
          <ContextMenuLabel>Layer actions</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => {
              setBlockAddOpen(true)
            }}
            disabled={disableAdd()}
          >
            <Plus size={14} className="mr-2 stroke-gray-400" /> Add component
          </ContextMenuItem>
          {!isMissing && (
            <ContextMenuItem
              onClick={() => {
                blockCopy({ index: props.index, id: block.id, parent: props.parent })
              }}
            >
              <Copy size={14} className="mr-2 stroke-gray-400" />
              Duplicate
            </ContextMenuItem>
          )}

          {!isMissing && (
            <ContextMenuItem
              onClick={() => {
                setTemplateAddOpen(true)
              }}
            >
              <Layout size={14} className="mr-2 stroke-gray-400" />
              Create template
            </ContextMenuItem>
          )}
          <ContextMenuItem
            onClick={() => {
              blockDelete({ index: props.index, id: block.id, parent: props.parent })
            }}
            className="text-red-500"
          >
            <Trash size={14} className="mr-2" /> Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <BlockDialogAdd open={blockAddOpen} setOpen={setBlockAddOpen} parent={props.parent} index={props.index} />
      <BlockDialogAddTemplate open={templateAddOpen} setOpen={setTemplateAddOpen} block={block} parent={props.parent} index={props.index} />
    </>
  )
}
