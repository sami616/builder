import { useEffect, useRef, useState } from 'react'
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
import { isBlock } from '@/api'
import { Missing } from '@/components/editor/missing'
import clsx from 'clsx'
import { useActive } from '@/hooks/use-active'
import { BlockItemActions } from './block-item-actions'
import { toast } from 'sonner'
import { validateComponentSlots } from './block-layer-item-slot'
import { useHovered } from '@/hooks/use-hovered'

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
  const [addBlockOpen, setAddBlockOpen] = useState(false)

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
      let error = undefined
      if (isBlock(props.parent.node)) {
        error = validateComponentSlots({ source, node: props.parent.node, slot: props.parent.slot })
      }

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

  useEffect(() => {
    if (!addBlockOpen) {
      popoverRef.current?.hidePopover()
      setHovered(undefined)
    }
  }, [addBlockOpen])

  return (
    <div
      // @ts-ignore
      style={{ anchorName: `--${block.id}` }}
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
        if (addBlockOpen) return
        setHovered(undefined)
        popoverRef.current?.hidePopover()
      }}
      ref={dropRef}
    >
      <div ref={dragRef}>
        <BlockItemActions
          addBlockOpen={addBlockOpen}
          setAddBlockOpen={setAddBlockOpen}
          parent={props.parent}
          index={props.index}
          block={block}
          popoverRef={popoverRef}
        />
        <Component {...componentProps} {...componentBlocks} />
        <DropIndicator closestEdge={closestEdge} variant="horizontal" />
        <DragPreview dragPreviewContainer={dragPreviewContainer}>{block.name}</DragPreview>
      </div>
    </div>
  )
}
