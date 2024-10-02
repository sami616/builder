import { type Page, type Block } from '@/db'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { DropIndicator } from '@/components/editor/DropIndicator'
import { isDragData } from '@/hooks/useDrag'
import { useDrop } from '@/hooks/useDrop'
import { DragPreview } from '@/components/editor/DragPreview'
import { useBlockDelete } from '@/hooks/useBlockDelete'
import { useBlockCopy } from '@/hooks/useBlockCopy'
import { useBlockUpdateName } from '@/hooks/useBlockUpdateName'
import { useBlockGet } from '@/hooks/useBlockGet'
import { useTemplateApply } from '@/hooks/useTemplateApply'
import { useDrag } from '@/hooks/useDrag'
import { BlockLayerItemSlot } from '@/components/editor/BlockLayerItemSlot'
import { useBlockAdd } from '@/hooks/useBlockAdd'
import { useBlockMove } from '@/hooks/useBlockMove'
import { isBlock } from '@/api'
import { ChevronDown, ChevronRight, Trash, Copy, GripVertical, Component } from 'lucide-react'
import { validateComponentSlots } from '@/components/editor/BlockItem'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'

export function BlockLayerItem(props: {
  blockId: Block['id']
  index: number
  parent: { slot: string; node: Block } | { slot: string; node: Page }
  hoveredBlockId?: Block['id']
  setHoveredBlockId: Dispatch<SetStateAction<Block['id'] | undefined>>
  setActiveBlockId: Dispatch<SetStateAction<Block['id'] | undefined>>
  activeBlockId?: Block['id']
}) {
  const dragRef = useRef<HTMLDivElement>(null)
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
  const [open, setOpen] = useState(false)

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

  const slotKeys = Object.keys(blockGet.data.slots)

  const item = (
    <div ref={dragRef} className="group flex gap-2 items-center justify-between w-full">
      <div className="grow flex items-center gap-2">
        <Component size={14} className={['stroke-emerald-500'].join(' ')} />
        {isRenaming && (
          <form
            className="grow"
            onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const updatedName = formData.get('name') as string
              await blockUpdateName.mutateAsync({ block: blockGet.data, name: updatedName })
              setIsRenaming(false)
            }}
          >
            <input
              className="w-full bg-transparent"
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
          <span
            onDoubleClick={(e) => {
              e.stopPropagation()
              setIsRenaming(true)
            }}
          >
            {blockGet.data.name}
          </span>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          props.setActiveBlockId((id) => {
            if (id === props.blockId) return undefined
            return props.blockId
          })
        }}
        className={['group', 'size-5', 'flex', 'items-center', 'justify-center'].join(' ')}
      >
        <div
          className={[
            'size-2',
            'rounded-full',
            isActiveBlock ? 'bg-emerald-500 group-hover:bg-emerald-600' : 'bg-gray-300 group-hover:bg-gray-400',
          ].join(' ')}
        />
      </button>
    </div>
  )

  if (slotKeys.length > 0) {
    return (
      <Collapsible asChild open={open} onOpenChange={setOpen}>
        <li
          ref={dropRef}
          data-drop-id={`block-${blockGet.data.id}`}
          className={[
            'cursor-move',
            'select-none',
            'grid',
            'gap-2',
            'p-2',
            'text-sm',
            isHoveredBlock && 'bg-gray-100',
            isDraggingSource ? 'opacity-50' : 'opacity-100',
            isActiveBlock && 'ring-inset ring-2 ring-emerald-500',
          ].join(' ')}
          data-component="BlockLayerItem"
          onMouseOver={(e) => {
            e.stopPropagation()
            props.setHoveredBlockId(props.blockId)
          }}
          onMouseOut={(e) => {
            e.stopPropagation()
            props.setHoveredBlockId(undefined)
          }}
        >
          <CollapsibleTrigger asChild>
            <div className="group w-full flex gap-2 items-center">
              {open ? (
                <ChevronDown size={16} className="cursor-pointer opacity-40 group-hover:opacity-100" />
              ) : (
                <ChevronRight size={16} className="cursor-pointer opacity-40 group-hover:opacity-100" />
              )}
              {item}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent asChild>
            <ul className="pl-2 ml-2 border-l border-dashed">
              {Object.keys(blockGet.data.slots).map((slot) => (
                <BlockLayerItemSlot
                  activeBlockId={props.activeBlockId}
                  setActiveBlockId={props.setActiveBlockId}
                  hoveredBlockId={props.hoveredBlockId}
                  setHoveredBlockId={props.setHoveredBlockId}
                  key={slot}
                  slot={slot}
                  block={blockGet.data}
                  parent={props.parent}
                />
              ))}
            </ul>
          </CollapsibleContent>
          <DropIndicator closestEdge={closestEdge} variant="horizontal" />
          <DragPreview dragPreviewContainer={dragPreviewContainer}>Move {blockGet.data.name} ↕</DragPreview>
        </li>
      </Collapsible>
    )
  }

  return (
    <li
      data-drop-id={`block-${blockGet.data.id}`}
      className={[
        'cursor-move',
        'select-none',
        'grid',
        'gap-2',
        'p-2',
        'text-sm',
        isHoveredBlock && 'bg-gray-100',
        isDraggingSource ? 'opacity-50' : 'opacity-100',
        isActiveBlock && 'ring-inset ring-2 ring-emerald-500',
      ].join(' ')}
      data-component="BlockLayerItem"
      onMouseOver={(e) => {
        e.stopPropagation()
        props.setHoveredBlockId(props.blockId)
      }}
      onMouseOut={(e) => {
        e.stopPropagation()
        props.setHoveredBlockId(undefined)
      }}
      ref={dropRef}
    >
      {item}
      <DropIndicator closestEdge={closestEdge} variant="horizontal" />
      <DragPreview dragPreviewContainer={dragPreviewContainer}>Move {blockGet.data.name} ↕</DragPreview>
    </li>
  )
}
