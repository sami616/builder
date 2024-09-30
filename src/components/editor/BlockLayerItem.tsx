import { type Page, type Block } from '@/db'
import { useEffect, useRef, useState } from 'react'
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
import {
  Folder,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  FolderOpen,
  Layers2,
  Trash,
  FileDown,
  Copy,
  Loader2,
  GripVertical,
  FolderPlus,
} from 'lucide-react'
import { validateComponentSlots } from '@/components/editor/BlockItem'
import { Tree } from '../ui/tree'
import { Button } from '../ui/button'

export function BlockLayerItem(props: {
  blockId: Block['id']
  index: number
  parent: { slot: string; node: Block } | { slot: string; node: Page }
  hoveredBlockId?: Block['id']
  setHoveredBlockId: (id: Block['id'] | undefined) => void
  setActiveBlockId: (id: Block['id'] | undefined) => void
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
  const slotKeys = Object.keys(blockGet.data.slots)
  const item = (
    <div className="group flex gap-2 items-center justify-between w-full">
      <div className="flex items-center gap-2">
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
      <div className="group-hover:opacity-100 opacity-100 flex items-center">
        {
          // <Button
          //   variant="ghost"
          //   size="icon"
          //   onClick={() => blockDelete.mutate({ blockId: blockGet.data.id, index: props.index, parent: props.parent })}
          // >
          //   <Trash
          //     onClick={() => blockDelete.mutate({ blockId: blockGet.data.id, index: props.index, parent: props.parent })}
          //     className="size-4 opacity-40"
          //   />
          // </Button>
          // <Button variant="ghost" size="icon" onClick={() => blockCopy.mutate({ index: props.index, id: props.blockId, parent: props.parent })}>
          //   <Copy className="size-4 opacity-40" />
          // </Button>
        }
        <span ref={dragRef} className="cursor-move">
          <GripVertical className="size-4 opacity-40" />
        </span>
      </div>
    </div>
  )

  return (
    <li
      data-drop-id={`block-${blockGet.data.id}`}
      // style={{ opacity: isDraggingSource ? 0.5 : 1, color: isActiveBlock ? 'blue' : isHoveredBlock ? 'red' : 'unset' }}
      className={`hover:bg-gray-100 ${isActiveBlock ? 'hover:bg-gray-300' : ''} text-sm ${isDraggingSource ? 'opacity-50' : 'opacity-100'} ${isActiveBlock ? 'bg-gray-200' : 'bg-white'} rounded-lg p-2`}
      data-component="BlockLayerItem"
      onClick={(e) => {
        e.stopPropagation()
        props.setActiveBlockId(props.blockId)
      }}
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
      <>
        {slotKeys.length > 0 && (
          <Tree
            openIcon={<ChevronDown className="size-4 opacity-40" />}
            closedIcon={<ChevronRight className="opacity-40 size-4" />}
            key={blockGet.data.id}
            label={item}
          >
            <>
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
            </>
          </Tree>
        )}

        {slotKeys.length === 0 && item}
      </>

      <DropIndicator closestEdge={closestEdge} variant="horizontal" />
      <DragPreview dragPreviewContainer={dragPreviewContainer}>Move {blockGet.data.name} ↕</DragPreview>
    </li>
  )
}
