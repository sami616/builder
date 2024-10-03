import { type Template } from '@/db'
import { ChevronDown, ChevronRight, MoreVertical, Component, CopyIcon, Trash, Pen, Layout } from 'lucide-react'
import { isDragData } from '@/hooks/useDrag'
import { useEffect, useRef, useState } from 'react'
import { DropIndicator } from '@/components/editor/DropIndicator'
import { DragPreview } from '@/components/editor/DragPreview'
import { useTemplateDelete } from '@/hooks/useTemplateDelete'
import { useTemplateUpdateName } from '@/hooks/useTemplateUpdateName'
import { useTemplateAdd } from '@/hooks/useTemplateAdd'
import { useTemplateReorder } from '@/hooks/useTemplateReorder'
import { useDrag } from '@/hooks/useDrag'
import { useDrop } from '@/hooks/useDrop'
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

export function TemplateItem(props: { template: Template; index: number }) {
  const dragRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLLIElement>(null)
  const [isRenaming, setIsRenaming] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))

  const { templateDelete } = useTemplateDelete()
  const { templateUpdateName } = useTemplateUpdateName()
  const { templateAdd } = useTemplateAdd()
  const { templateReorder } = useTemplateReorder()

  useEffect(() => {
    async function handleClickOutside(e: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        await templateUpdateName.mutateAsync({ template: props.template, name: inputRef.current.value })
        setIsRenaming(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.select()
    }
  }, [isRenaming])

  const { dragPreviewContainer, isDraggingSource } = useDrag({ dragRef, data: { id: 'template', index: props.index, node: props.template } })

  const { closestEdge } = useDrop({
    dropRef,
    disableDrop: ({ source, element }) => source.data.id === 'componentItem' && element.getAttribute('data-component') === 'TemplateItem',
    data: { index: props.index, node: props.template },
    onDrop: ({ source, target }) => {
      if (isDragData['block'](source.data)) {
        templateAdd.mutate({ source: source.data, target: target.data })
      }
      if (isDragData['template'](source.data)) {
        templateReorder.mutate({ source: source.data, target: target.data })
      }
    },
  })

  return (
    <Tree
      li={{ className: 'hover:bg-gray-100', 'data-component': 'TemplateItem' }}
      item={
        <>
          <Layout size={14} className={['shrink-0', 'stroke-emerald-500'].join(' ')} />
          {isRenaming && (
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const updatedName = formData.get('name') as string
                await templateUpdateName.mutateAsync({ template: props.template, name: updatedName })
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
                defaultValue={props.template.name}
              />
            </form>
          )}

          {!isRenaming && (
            <span
              className="w-full"
              onDoubleClick={(e) => {
                e.stopPropagation()
                setIsRenaming(true)
              }}
            >
              {props.template.name}
            </span>
          )}
        </>
      }
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
            <DropdownMenuLabel>Template actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={isCanvasMutating} onClick={() => setIsRenaming(true)}>
              <Pen size={14} className="opacity-40 mr-2" /> Rename
              <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                templateDelete.mutate({ template: props.template })
              }}
            >
              <Trash size={14} className="opacity-40 mr-2" /> Delete
              <DropdownMenuShortcut>⇧⌘D</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
      drop={{ ref: dropRef, edge: closestEdge }}
      drag={{ ref: dragRef, isDragging: isDraggingSource, preview: { container: dragPreviewContainer, children: props.template.name } }}
    />
  )
}
