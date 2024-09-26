import { useRef } from 'react'
import { DropIndicator } from './DropIndicator'
import { type Block, type Page } from '../db'
import { useRouteContext } from '@tanstack/react-router'
import { DragPreview } from './DragPreview'
import { DropZone } from './DropZone'
import { isDragData } from '../utils/useDrag'
import { useBlockDelete } from '../utils/useBlockDelete'
import { useBlockCopy } from '../utils/useBlockCopy'
import { useBlockGet } from '../utils/useBlockGet'
import { useBlockAdd } from '../utils/useBlockAdd'
import { useTemplateApply } from '../utils/useTemplateApply'
import { useDrop } from '../utils/useDrop'
import { useDrag } from '../utils/useDrag'
import { useBlockMove } from '../utils/useBlockMove'
import { config } from '../main'
import { isBlock } from '../api'
// import { useMutationState } from '@tanstack/react-query'

export function BlockItem(props: {
  index: number
  page: Page
  parent: { slot: string; node: Block | Page }
  blockId: Block['id']
  activeBlockId?: Block['id']
  setActiveBlockId: (id: Block['id'] | undefined) => void
  hoveredBlockId?: Block['id']
  setHoveredBlockId: (id: Block['id'] | undefined) => void
}) {
  const dropRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const context = useRouteContext({ from: '/pages/$id' })
  const isActiveBlock = props.activeBlockId === props.blockId
  const isHoveredBlock = props.hoveredBlockId === props.blockId

  const { blockGet } = useBlockGet({ id: props.blockId })
  const { blockAdd } = useBlockAdd()
  const { blockCopy } = useBlockCopy()
  const { blockDelete } = useBlockDelete()
  const { blockMove } = useBlockMove()
  const { templateApply } = useTemplateApply()

  // const mutationState = useMutationState<Block>({
  //   filters: {
  //     mutationKey: ['updateBlock', props.blockId],
  //     status: 'pending',
  //   },
  //   select: (data) => (data.state.variables as Record<'block', Block>).block,
  // })?.at(-1)

  // const block = mutationState ?? blockGet.data

  const block = blockGet.data
  const componentProps = block.props

  const { closestEdge } = useDrop({
    dropRef: dropRef,
    data: { index: props.index, parent: props.parent, node: block },
    disableDrop: ({ source, element }) => {
      if (isBlock(props.parent.node)) {
        try {
          validateComponentSlots({ source, element, node: props.parent.node, slot: props.parent.slot })
        } catch (e) {
          return true
        }
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

  const { isDraggingSource, dragPreviewContainer } = useDrag({
    dragRef,
    data: { id: 'block', index: props.index, parent: props.parent, node: block },
  })

  const componentBlocks = Object.keys(block.slots).reduce<{
    [key: string]: JSX.Element[] | JSX.Element
  }>((acc, slot) => {
    if (block.slots[slot].length === 0) {
      acc[slot] = (
        <DropZone
          label={context.config[block.type].slots?.[slot].name}
          data={{ parent: { slot, node: block } }}
          disableDrop={({ source, element }) => {
            try {
              validateComponentSlots({ source, element, node: block, slot })
            } catch (e) {
              return true
            }
          }}
          onDrop={({ source, target }) => {
            if (isDragData['component'](source.data)) {
              blockAdd.mutate({ source: source.data, target: target.data })
            }
            if (isDragData['template'](source.data)) {
              templateApply.mutate({ source: source.data, target: target.data })
            }
            if (isDragData['block'](source.data)) {
              blockMove.mutate({ source: source.data, target: target.data })
            }
          }}
        />
      )
    } else {
      acc[slot] = block.slots[slot].map((blockId, index) => {
        return (
          <BlockItem
            hoveredBlockId={props.hoveredBlockId}
            setHoveredBlockId={props.setHoveredBlockId}
            index={index}
            parent={{ slot, node: block }}
            page={props.page}
            activeBlockId={props.activeBlockId}
            setActiveBlockId={props.setActiveBlockId}
            key={blockId}
            blockId={blockId}
          />
        )
      })
    }

    return acc
  }, {})

  const Component = context.config[block.type].component

  return (
    <div
      // @ts-ignore
      style={{ anchorName: `--${block.id}` }}
      data-active={isActiveBlock}
      data-hovered={isHoveredBlock}
      data-dragging={isDraggingSource}
      data-component="BlockItem"
      onDoubleClick={(e) => {
        e.stopPropagation()
        props.setActiveBlockId(props.blockId)
      }}
      onMouseOver={(e) => {
        e.stopPropagation()
        props.setHoveredBlockId(props.blockId)
        popoverRef.current?.showPopover()
      }}
      onMouseOut={(e) => {
        e.stopPropagation()
        props.setHoveredBlockId(undefined)
        popoverRef.current?.hidePopover()
      }}
      ref={dropRef}
    >
      <div
        // @ts-ignore
        style={{ positionAnchor: `--${block.id}` }}
        popover="true"
        ref={popoverRef}
        data-context
      >
        <div>
          <span ref={dragRef}>Move</span>
          <button
            onClick={() => {
              blockCopy.mutate({ index: props.index, root: { store: 'blocks', id: props.blockId }, parent: props.parent })
            }}
          >
            Duplicate
          </button>
          <button
            onClick={() => {
              blockDelete.mutate({
                index: props.index,
                blockId: props.blockId,
                parent: props.parent,
              })
              props.setActiveBlockId(undefined)
            }}
          >
            Delete
          </button>
        </div>
      </div>
      <Component {...componentProps} {...componentBlocks} />
      <DropIndicator closestEdge={closestEdge} variant="horizontal" />
      <DragPreview dragPreviewContainer={dragPreviewContainer}>Move {block.name} ↕</DragPreview>
    </div>
  )
}

export function validateComponentSlots(args: { source: Record<string, any>; node: Block; slot: string; element: Element }) {
  const disabledComponents = config[args.node.type].slots?.[args.slot].validation?.disabledComponents
  const maxItems = config[args.node.type].slots?.[args.slot].validation?.maxItems
  const itemsLength = args.node.slots[args.slot].length
  const sourceEl = args.source.element.closest('[data-drop-target-for-element="true"]')

  if (sourceEl?.parentElement?.closest('[data-drop-target-for-element="true"]') === args.element) {
    throw new Error(`Component is already in this slot`)
  }

  if (maxItems) {
    if (itemsLength >= maxItems) {
      throw new Error(`Max items in `)
    }
  }
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
