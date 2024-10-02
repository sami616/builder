import { useRef } from 'react'
import { DropIndicator } from '@/components/editor/DropIndicator'
import { type Block, type Page } from '@/db'
import { useRouteContext } from '@tanstack/react-router'
import { DragPreview } from '@/components/editor/DragPreview'
import { DropZone } from '@/components/editor/DropZone'
import { isDragData } from '@/hooks/useDrag'
import { useBlockDelete } from '@/hooks/useBlockDelete'
import { useBlockCopy } from '@/hooks/useBlockCopy'
import { useBlockGet } from '@/hooks/useBlockGet'
import { useBlockAdd } from '@/hooks/useBlockAdd'
import { useTemplateApply } from '@/hooks/useTemplateApply'
import { useDrop } from '@/hooks/useDrop'
import { useDrag } from '@/hooks/useDrag'
import { useBlockMove } from '@/hooks/useBlockMove'
import { config } from '@/main'
import { isBlock } from '@/api'
import { Missing } from './Missing'
import { CircleDashed } from 'lucide-react'

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
    const missingSlot = !context.config[block.type]?.slots?.[slot]
    if (block.slots[slot].length === 0) {
      acc[slot] = missingSlot ? (
        <Missing node={{ type: 'slot', name: slot }} />
      ) : (
        <DropZone
          children={
            <>
              <CircleDashed size={16} className="opacity-40" />
              {context.config[block.type].slots?.[slot].name}
            </>
          }
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

  const Component = context.config[block.type]?.component ?? (() => <Missing node={{ type: 'component', name: block.type }} />)

  return (
    <div
      // @ts-ignore
      style={{ anchorName: `--${block.id}` }}
      className={[
        'relative',
        isActiveBlock ? 'outline outline-2 outline-emerald-500 z-50' : '',
        isHoveredBlock ? 'outline outline-2 outline-rose-500 z-50' : '',
      ].join(' ')}
      data-component="BlockItem"
      data-drop-id={`block-${blockGet.data.id}`}
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
              blockCopy.mutate({ index: props.index, id: props.blockId, parent: props.parent })
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
      <DragPreview dragPreviewContainer={dragPreviewContainer}>{block.name}</DragPreview>
    </div>
  )
}

export function validateComponentSlots(args: { source: Record<string, any>; node: Block; slot: string; element: Element }) {
  const disabledComponents = config[args.node.type].slots?.[args.slot].validation?.disabledComponents
  const maxItems = config[args.node.type].slots?.[args.slot].validation?.maxItems
  const itemsLength = args.node.slots[args.slot].length

  // disallow a component to be dropped into itself or any of its children
  if (isDragData['block'](args.source.data)) {
    const sourceId = args.source.element.closest('[data-drop-id^="block"]')?.getAttribute('data-drop-id')

    const targetEl = args.element.closest('[data-drop-id^="block"]')
    const targetId = targetEl?.getAttribute('data-drop-id')

    const commonParent = targetEl?.closest(`[data-drop-id="${sourceId}"]`)
    const dropSourceId = commonParent?.getAttribute('data-drop-id')

    const commonChild = commonParent?.querySelector(`[data-drop-id="${targetId}"]`)
    const childOrSelf = dropSourceId === targetId ? commonParent : commonChild

    if (childOrSelf) {
      if (commonParent?.contains(childOrSelf)) return false
    }
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
