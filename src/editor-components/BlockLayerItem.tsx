import { type Page, type Block } from '../db'
import { useEffect, useRef, useState } from 'react'
import { DropIndicator } from './DropIndicator'
import { isDragData } from '../utils/useDrag'
import { useDrop } from '../utils/useDrop'
import { DragPreview } from './DragPreview'
import { useBlockDelete } from '../utils/useBlockDelete'
import { useBlockCopy } from '../utils/useBlockCopy'
import { useBlockUpdateName } from '../utils/useBlockUpdateName'
import { useBlockGet } from '../utils/useBlockGet'
import { useTemplateApply } from '../utils/useTemplateApply'
import { useDrag } from '../utils/useDrag'
import { BlockLayerItemSlot } from './BlockLayerItemSlot'
import { useBlockAdd } from '../utils/useBlockAdd'
import { useBlockMove } from '../utils/useBlockMove'
import { isBlock } from '../api'
import { validateComponentSlots } from './BlockItem'

export function BlockLayerItem(props: {
  blockId: Block['id']
  index: number
  parent: { slot: string; node: Block } | { slot: string; node: Page }
  hoveredBlockId?: Block['id']
  setHoveredBlockId: (id: Block['id'] | undefined) => void
  activeBlockId?: Block['id']
}) {
  const dragRef = useRef<HTMLLIElement>(null)
  const dropRef = useRef<HTMLLIElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isRenaming, setIsRenaming] = useState(false)
  const { blockGet } = useBlockGet({ id: props.blockId })
  const { blockCopy } = useBlockCopy()
  const { blockDelete } = useBlockDelete()
  const { blockUpdateName } = useBlockUpdateName()
  const isHoveredBlock = props.hoveredBlockId === props.blockId
  const isActiveBlock = props.activeBlockId === props.blockId
  const { blockMove } = useBlockMove()
  const { blockAdd } = useBlockAdd()
  const { templateApply } = useTemplateApply()

  useEffect(() => {
    async function handleClickOutside(e: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        await blockUpdateName.mutateAsync({ block: blockGet.data, name: inputRef.current.value })
        setIsRenaming(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const { isDraggingSource, dragPreviewContainer } = useDrag({
    dragRef,
    data: { id: 'block', parent: props.parent, node: blockGet.data, index: props.index },
  })

  const { closestEdge } = useDrop({
    dropRef,
    data: { parent: props.parent, node: blockGet.data, index: props.index },
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
    disableDrop: ({ source, element }) => {
      if (isBlock(props.parent.node)) {
        try {
          validateComponentSlots({ source, element, node: props.parent.node, slot: props.parent.slot })
        } catch (e) {
          return true
        }
      }
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
      data-component="BlockLayerItem"
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
              await blockUpdateName.mutateAsync({ block: blockGet.data, name: updatedName })
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
              defaultValue={blockGet.data.name}
            />
          </form>
        )}
        {!isRenaming && (
          <>
            {blockGet.data.name}
            <button onClick={() => blockDelete.mutate({ blockId: blockGet.data.id, index: props.index, parent: props.parent })}>del</button>
            <button onClick={() => blockCopy.mutate({ index: props.index, id: props.blockId, parent: props.parent })}>dup</button>
            <span ref={dragRef}>move</span>
          </>
        )}
      </>

      {Object.keys(blockGet.data.slots).map((slot) => (
        <BlockLayerItemSlot
          activeBlockId={props.activeBlockId}
          hoveredBlockId={props.hoveredBlockId}
          setHoveredBlockId={props.setHoveredBlockId}
          key={slot}
          slot={slot}
          block={blockGet.data}
          parent={props.parent}
        />
      ))}
      <DropIndicator closestEdge={closestEdge} variant="horizontal" />
      <DragPreview dragPreviewContainer={dragPreviewContainer}>Move {blockGet.data.name} ↕</DragPreview>
    </li>
  )
}