import { Experience, type Block } from '../db'
import { useRouteContext } from '@tanstack/react-router'
import { ComponentProps, useEffect, useRef, useState } from 'react'
import './LayerItem.css'
import { DropIndicator } from './DropIndicator'
import { useDragDrop } from '../utils/useDragDrop'
import { useDrop } from '../utils/useDrop'
import { DragPreview } from './DragPreview'
import { useBlockDelete } from '../utils/useBlockDelete'
import { useBlockCopy } from '../utils/useBlockCopy'
import { useBlockUpdateName } from '../utils/useBlockUpdateName'
import { useBlockGet } from '../utils/useBlockGet'

export function LayerItem(props: {
  blockId: Block['id']
  index: number
  isCanvasUpdatePending: boolean
  parent: { slot: string; node: Block } | { slot: string; node: Experience }
  hoveredBlockId?: Block['id']
  setHoveredBlockId: (id: Block['id'] | undefined) => void
  activeBlockId?: Block['id']
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<HTMLLIElement>(null)
  const dropRef = useRef<HTMLLIElement>(null)

  const query = useBlockGet({ id: props.blockId })

  const [isRenaming, setIsRenaming] = useState(false)
  const blockCopy = useBlockCopy()
  const blockDelete = useBlockDelete()

  useEffect(() => {
    async function handleClickOutside(e: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        await blockUpdateName.mutateAsync({ block: query.data, name: inputRef.current.value })
        setIsRenaming(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const blockUpdateName = useBlockUpdateName()

  const isHoveredBlock = props.hoveredBlockId === props.blockId
  const isActiveBlock = props.activeBlockId === props.blockId

  const { isDraggingSource, closestEdge, dragPreviewContainer } = useDragDrop({
    dragRef,
    dropRef,
    disableDrag: props.isCanvasUpdatePending,
    data: {
      id: 'blockDragDrop',
      parent: props.parent,
      node: query.data,
      index: props.index,
    },
  })

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.select()
    }
  }, [isRenaming])

  return (
    <li
      style={{ opacity: isDraggingSource ? 0.5 : 1, color: isActiveBlock ? 'blue' : isHoveredBlock ? 'red' : 'unset' }}
      data-component="LayerItem"
      onMouseOver={(e) => {
        e.stopPropagation()
        props.setHoveredBlockId(props.blockId)
      }}
      onMouseOut={(e) => {
        e.stopPropagation()
        props.setHoveredBlockId(undefined)
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        setIsRenaming(true)
      }}
      ref={dropRef}
    >
      <>
        {isRenaming && (
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const updatedName = formData.get('name') as string
              await blockUpdateName.mutateAsync({ block: query.data, name: updatedName })
              setIsRenaming(false)
            }}
          >
            <input
              ref={inputRef}
              name="name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsRenaming(false)
                }
              }}
              defaultValue={query.data.name}
            />
          </form>
        )}
        {!isRenaming && (
          <>
            {query.data.name}
            <button onClick={() => blockDelete.mutate({ blockId: query.data.id, index: props.index, parent: props.parent })}>del</button>
            <button onClick={() => blockCopy.mutate({ index: props.index, root: { store: 'blocks', id: props.blockId }, parent: props.parent })}>
              dup
            </button>
            <span ref={dragRef}>move</span>
          </>
        )}
      </>

      {Object.keys(query.data.slots).map((slot) => (
        <LayerItemSlot
          activeBlockId={props.activeBlockId}
          hoveredBlockId={props.hoveredBlockId}
          setHoveredBlockId={props.setHoveredBlockId}
          key={slot}
          slot={slot}
          block={query.data}
          isCanvasUpdatePending={props.isCanvasUpdatePending}
          parent={props.parent}
        />
      ))}
      <DropIndicator closestEdge={closestEdge} variant="horizontal" />
      <DragPreview dragPreviewContainer={dragPreviewContainer}>Move {query.data.name} ↕</DragPreview>
    </li>
  )
}

function LayerItemSlot(props: {
  block: Block
  slot: string
  isCanvasUpdatePending: ComponentProps<typeof LayerItem>['isCanvasUpdatePending']
  parent: ComponentProps<typeof LayerItem>['parent']
  hoveredBlockId?: Block['id']
  setHoveredBlockId: (id: Block['id'] | undefined) => void
  activeBlockId?: Block['id']
}) {
  const ref = useRef<HTMLDetailsElement>(null)

  const { isDraggingOver } = useDrop({
    dropRef: ref,
    disableDrop: ({ source, element }) => {
      const sourceEl = source.element.closest('[data-drop-target-for-element="true"]')
      return sourceEl?.parentElement?.closest('[data-drop-target-for-element="true"]') === element
    },

    data: { id: 'blockDrop', parent: { slot: props.slot, node: props.block } },
  })

  const context = useRouteContext({ from: '/experiences/$id' })

  const hasSlotEntries = props.block.slots[props.slot].length > 0

  return (
    <details open={hasSlotEntries} style={{ outline: isDraggingOver ? '2px solid red' : 'none' }} ref={ref}>
      <summary>{context.config[props.block.type].slots[props.slot].name}</summary>
      <ul>
        {props.block.slots[props.slot].map((blockId, index) => (
          <LayerItem
            activeBlockId={props.activeBlockId}
            hoveredBlockId={props.hoveredBlockId}
            setHoveredBlockId={props.setHoveredBlockId}
            isCanvasUpdatePending={props.isCanvasUpdatePending}
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
