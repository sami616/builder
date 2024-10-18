import { useRef, useState } from 'react'
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
import { useHovered } from '@/hooks/use-hovered'
import { validateSlotBlock, validateSlotMax } from './block-layer-item-slot'
import { Copy, Layout, Plus, Trash } from 'lucide-react'
import { PopoverTrigger, Popover } from '../ui/popover'
import { PopoverContent } from '@radix-ui/react-popover'
import {
  ContextMenu,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu'

export function BlockItem(props: { index: number; page: Page; parent: { slot: string; node: Block | Page }; blockId: Block['id'] }) {
  const { blockGet } = useBlockGet({ id: props.blockId })
  const block = blockGet.data
  const componentProps = block.props
  const { blockAdd } = useBlockAdd()
  const { blockMove } = useBlockMove()
  const { templateApply } = useTemplateApply()
  const { active, setActive } = useActive()
  const dropRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const { isHovered, setHovered } = useHovered()
  const context = useRouteContext({ from: '/pages/$id' })
  const isActiveBlock = active?.store === 'blocks' && active.id === block.id
  const isHoveredBlock = isHovered(block.id)
  const [actionsOpen, setActionsOpen] = useState(false)

  // const mutationState = useMutationState<Block>({
  //   filters: {
  //     mutationKey: ['updateBlock', props.blockId],
  //     status: 'pending',
  //   },
  //   select: (data) => (data.state.variables as Record<'block', Block>).block,
  // })?.at(-1)

  // const block = mutationState ?? blockGet.data

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
      return <BlockItem index={index} parent={{ slot, node: block }} page={props.page} key={blockId} blockId={blockId} />
    })

    return acc
  }, {})

  const Component = context.config[block.type]?.component ?? (() => <Missing node={{ type: 'component', name: block.type }} />)

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          data-component="BlockItem"
          className={clsx([
            'relative',
            'outline',
            'outline-2',
            '-outline-offset-2',
            'outline-none',
            isDraggingSource && 'opacity-50',
            isActiveBlock && 'outline-rose-500',
            isHoveredBlock && 'outline-emerald-500',
            isHoveredBlock && isActiveBlock && 'outline-rose-600',
          ])}
          data-drop-id={`block-${blockGet.data.id}`}
          onClick={(e) => {
            e.stopPropagation()
            setActive((active) => {
              if (active?.id === block.id) return undefined
              return { store: 'blocks', id: block.id }
            })
          }}
          onMouseOver={(e) => {
            e.stopPropagation()
            setHovered(block.id)
            popoverRef.current?.showPopover()
          }}
          onMouseOut={(e) => {
            e.stopPropagation()
            if (actionsOpen) return
            setHovered(undefined)
            popoverRef.current?.hidePopover()
          }}
          ref={dropRef}
        >
          <div ref={dragRef}>
            <div className={clsx(['group', 'top-0', 'absolute', 'w-full', 'h-3', 'z-50'])}>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    className={clsx([
                      'size-5',
                      'items-center',
                      'justify-center',
                      'rounded-full',
                      'absolute',
                      'top-0',
                      '-mt-2.5',
                      '-ml-2.5',
                      'left-1/2',
                      'scale-50',
                      'flex',
                      'transition',
                      'group-hover:scale-100',
                      isActiveBlock && 'bg-rose-500',
                      isHoveredBlock && 'bg-emerald-500',
                      isHoveredBlock && isActiveBlock && 'bg-rose-600',
                    ])}
                  >
                    <Plus size={14} className="stroke-white" />
                  </button>
                </PopoverTrigger>
                <PopoverContent>Above</PopoverContent>
              </Popover>
            </div>
            {/* <div */}
            {/*   className={clsx([ */}
            {/*     'absolute', */}
            {/*     'right-0', */}
            {/*     'size-6', */}
            {/*     'text-white', */}
            {/*     'justify-center', */}
            {/*     'items-center', */}
            {/*     isActiveBlock ? 'bg-rose-500' : 'bg-emerald-500', */}
            {/*     isHoveredBlock || isActiveBlock ? 'flex' : 'hidden', */}
            {/*   ])} */}
            {/* > */}
            {/*   <BlockActions */}
            {/*     trigger={<MoreHorizontal size={16} />} */}
            {/*     parent={props.parent} */}
            {/*     actionsOpen={actionsOpen} */}
            {/*     setActionsOpen={setActionsOpen} */}
            {/*     block={block} */}
            {/*     index={props.index} */}
            {/*   /> */}
            {/* </div> */}

            <div className={clsx(['group', 'bottom-0', 'absolute', 'w-full', 'h-3', 'z-50'])}>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    className={clsx([
                      'size-5',
                      'items-center',
                      'justify-center',
                      'rounded-full',
                      'absolute',
                      'bottom-0',
                      '-mb-2.5',
                      'left-1/2',
                      '-ml-2.5',
                      'scale-50',
                      'flex',
                      'transition',
                      'group-hover:scale-100',
                      isActiveBlock && 'bg-rose-500',
                      isHoveredBlock && 'bg-emerald-500',
                      isHoveredBlock && isActiveBlock && 'bg-rose-600',
                    ])}
                  >
                    <Plus size={14} className="stroke-white" />
                  </button>
                </PopoverTrigger>
                <PopoverContent>Below</PopoverContent>
              </Popover>
            </div>
            <Component {...componentProps} {...componentBlocks} />
            <DropIndicator closestEdge={closestEdge} variant="horizontal" />
            <DragPreview dragPreviewContainer={dragPreviewContainer}>{block.name}</DragPreview>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuLabel>Layer actions</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Plus size={14} className="mr-2 opacity-40" /> Add component
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>Above</ContextMenuItem>
            <ContextMenuItem>Below</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuItem>
          <Copy size={14} className="mr-2 opacity-40" />
          Duplicate
        </ContextMenuItem>
        <ContextMenuItem>
          <Layout size={14} className="mr-2 opacity-40" />
          Create template
        </ContextMenuItem>
        <ContextMenuItem className="text-red-500">
          <Trash size={14} className="mr-2" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
