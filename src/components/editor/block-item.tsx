import { useDeferredValue, useRef, useState } from 'react'
import { DropIndicator } from '@/components/editor/drop-indicator'
import { type Block, type Page } from '@/db'
import { useRouteContext } from '@tanstack/react-router'
import { DragPreview } from '@/components/editor/drag-preview'
import { useDrag, isDragData } from '@/hooks/use-drag'
import { useTemplateApply } from '@/hooks/use-template-apply'
import { useBlockGet } from '@/hooks/use-block-get'
import { useBlockAdd } from '@/hooks/use-block-add'
import { Edge, getEdge, useDrop } from '@/hooks/use-drop'
import { useBlockMove } from '@/hooks/use-block-move'
import { Missing } from '@/components/editor/missing'
import clsx from 'clsx'
import { useActive } from '@/hooks/use-active'
import { toast } from 'sonner'
import { useHovered } from '@/hooks/use-hovered'
import { validateSlotBlock, validateSlotMax } from './block-layer-item-slot'
import { BlockActions } from '@/components/editor/block-actions'
import { MoreHorizontal, Plus } from 'lucide-react'
import { PopoverTrigger, Popover } from '../ui/popover'
import { PopoverContent } from '@radix-ui/react-popover'

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
  const [hoverEdge, setHoverEdge] = useState<Edge>(null)
  const defferedHoverEdge = useDeferredValue(hoverEdge)

  return (
    <div
      onMouseMove={(e) => {
        const edge = getEdge(e, dropRef.current!)
        setHoverEdge(edge)
      }}
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
        setHoverEdge(null)
        if (actionsOpen) return
        setHovered(undefined)
        popoverRef.current?.hidePopover()
      }}
      ref={dropRef}
    >
      <div ref={dragRef}>
        <Popover>
          <PopoverTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation()
              }}
              className={clsx([
                'size-5',
                'items-center',
                'z-50',
                'justify-center',
                'rounded-full',
                'absolute',
                'top-0',
                '-mt-2.5',
                '-ml-2.5',
                'left-1/2',
                defferedHoverEdge === 'top' && isHoveredBlock ? 'flex' : 'hidden',
                isActiveBlock && 'bg-rose-500',
                isHoveredBlock && 'bg-emerald-500',
                isHoveredBlock && isActiveBlock && 'bg-rose-600',
              ])}
            >
              <Plus size={14} className="stroke-white" />
            </button>
          </PopoverTrigger>
          <PopoverContent>Content!</PopoverContent>
        </Popover>
        <div
          className={clsx([
            'absolute',
            'right-0',
            'size-6',
            'text-white',
            'justify-center',
            'items-center',
            isActiveBlock ? 'bg-rose-500' : 'bg-emerald-500',
            isHoveredBlock || isActiveBlock ? 'flex' : 'hidden',
          ])}
        >
          <BlockActions
            trigger={<MoreHorizontal size={16} />}
            parent={props.parent}
            actionsOpen={actionsOpen}
            setActionsOpen={setActionsOpen}
            block={block}
            index={props.index}
          />
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
          }}
          className={clsx([
            'size-5',
            'z-50',
            'items-center',
            'justify-center',
            'rounded-full',
            'absolute',
            'bottom-0',
            '-mb-2.5',
            'left-1/2',
            '-ml-2.5',
            defferedHoverEdge === 'bottom' && isHoveredBlock ? 'flex' : 'hidden',
            isActiveBlock && 'bg-rose-500',
            isHoveredBlock && 'bg-emerald-500',
            isHoveredBlock && isActiveBlock && 'bg-rose-600',
          ])}
        >
          <Plus size={14} className="stroke-white" />
        </button>
        <Component {...componentProps} {...componentBlocks} />
        <DropIndicator closestEdge={closestEdge} variant="horizontal" />
        <DragPreview dragPreviewContainer={dragPreviewContainer}>{block.name}</DragPreview>
      </div>
    </div>
  )
}
