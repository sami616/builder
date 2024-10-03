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
import { useTemplateAdd } from '@/hooks/useTemplateAdd'
import { isBlock } from '@/api'
import { ChevronDown, ChevronRight, MoreVertical, Component, CopyIcon, Trash, Pen, Layout } from 'lucide-react'
import { validateComponentSlots } from '@/components/editor/BlockItem'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { Button } from '../ui/button'
import { Tree } from '../ui/tree'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useIsMutating } from '@tanstack/react-query'
import { Input } from '../ui/input'

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
  const { templateAdd } = useTemplateAdd()
  const { blockUpdateName } = useBlockUpdateName()
  const isHoveredBlock = props.hoveredBlockId === props.blockId
  const isActiveBlock = props.activeBlockId === props.blockId
  const { blockMove } = useBlockMove()
  const { blockAdd } = useBlockAdd()
  const { templateApply } = useTemplateApply()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
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

  function selectInput() {
    inputRef.current?.select()
    inputRef.current?.focus()
  }

  useEffect(() => {
    if (isRenaming) {
      selectInput()
    }
  }, [isRenaming])

  return (
    <Tree
      open={open}
      setOpen={setOpen}
      drop={{ ref: dropRef, edge: closestEdge }}
      drag={{ ref: dragRef, preview: { container: dragPreviewContainer, children: blockGet.data.name }, isDragging: isDraggingSource }}
      isHovered={isHoveredBlock}
      action={
        <DropdownMenu>
          <DropdownMenuTrigger disabled={isCanvasMutating}>
            <MoreVertical size={16} className="shrink-0 opacity-40 hover:opacity-100" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            onCloseAutoFocus={(e) => {
              if (isRenaming) {
                e.preventDefault()
                inputRef.current?.focus()
                inputRef.current?.select()
              }
            }}
            className="w-56"
            align="start"
          >
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isCanvasMutating}
              onClick={async (e) => {
                e.stopPropagation()
                blockCopy.mutate({ index: props.index, id: props.blockId, parent: props.parent })
              }}
            >
              <CopyIcon size={14} className="opacity-40  mr-2" /> Duplicate
              <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuItem disabled={isCanvasMutating} onClick={() => setIsRenaming(true)}>
              <Pen size={14} className="opacity-40 mr-2" /> Rename
              <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={isCanvasMutating}
              onClick={(e) => {
                e.stopPropagation()
                templateAdd.mutate({ source: { id: 'block', index: props.index, node: blockGet.data, parent: props.parent } })
              }}
            >
              <Layout size={14} className="opacity-40 mr-2" />
              Template
              <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                blockDelete.mutate({ index: props.index, blockId: props.blockId, parent: props.parent })
                props.setActiveBlockId(undefined)
              }}
            >
              <Trash size={14} className="opacity-40 mr-2" /> Delete
              <DropdownMenuShortcut>⇧⌘D</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
      item={
        <>
          <Component size={14} className={['shrink-0', 'stroke-emerald-500'].join(' ')} />
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
                className="focus:bg-gray-300 p-1 rounded focus:outline-none w-full bg-transparent"
                ref={inputRef}
                name="name"
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
              className="w-full p-1"
              onDoubleClick={(e) => {
                e.stopPropagation()
                setIsRenaming(true)
              }}
            >
              {blockGet.data.name}
            </span>
          )}
        </>
      }
      isActive={isActiveBlock}
      setActive={(e) => {
        e.stopPropagation()
        props.setActiveBlockId((id) => {
          if (id === props.blockId) return undefined
          return props.blockId
        })
      }}
      li={{
        'data-drop-id': `block-${blockGet.data.id}`,
        'data-component': 'BlockLayerItem',
        onMouseLeave: (e) => {
          e.stopPropagation()
          props.setHoveredBlockId(undefined)
        },
        onMouseOver: (e) => {
          e.stopPropagation()
          props.setHoveredBlockId(props.blockId)
        },
      }}
      items={Object.keys(blockGet.data.slots).map((slot) => (
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
    />
  )
}
