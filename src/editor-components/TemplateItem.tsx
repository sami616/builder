import './TemplateItem.css'
import { type Template, db } from '../db'
import { useDragDrop } from '../utils/useDragDrop'
import { useEffect, useRef, useState } from 'react'
import { DropIndicator } from './DropIndicator'
import { DragPreview } from './DragPreview'
import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'

export function TemplateItem(props: { template: Template; index: number; isCanvasUpdatePending: boolean }) {
  const dragDropSourceRef = useRef<HTMLLIElement>(null)
  const dragDropTargetRef = useRef<HTMLLIElement>(null)
  const context = useRouteContext({ from: '/experiences/$id' })
  const [isRenaming, setIsRenaming] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const updateTemplateName = useMutation({
    mutationFn: async (args: { template: Template; name: string }) => {
      const clonedEntry = structuredClone(args.template)
      clonedEntry.name = args.name
      return context.update({ entry: clonedEntry })
    },
    onSuccess: () => {
      context.queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })

  useEffect(() => {
    async function handleClickOutside(e: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        await updateTemplateName.mutateAsync({ template: props.template, name: inputRef.current.value })
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

  const { isDraggingSource, closestEdge, dragPreviewContainer } = useDragDrop({
    dragRef: dragDropSourceRef,
    dropRef: dragDropTargetRef,
    disableDrag: props.isCanvasUpdatePending,
    disableDrop: ({ source, element }) => source.data.id === 'componentItem' && element.getAttribute('data-component') === 'TemplateItem',
    data: { id: 'templateDragDrop', index: props.index, node: props.template },
  })

  const removeTemplate = useMutation({
    mutationFn: async (args: { template: Template }) => {
      const tx = db.transaction('templates', 'readwrite')
      const order = args.template.order
      const index = tx.store.index('order')
      const range = IDBKeyRange.lowerBound(order)
      let cursor = await index.openCursor(range, 'next')

      while (cursor) {
        const item = cursor.value
        item.order = item.order - 1
        await cursor.update(item)
        cursor = await cursor.continue()
      }

      const tree = await context.getTree({ root: { store: 'templates', id: args.template.id } })
      return context.removeMany({ entries: tree })
    },
    onSuccess: () => {
      context.queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })

  return (
    <li
      data-component="TemplateItem"
      onDoubleClick={(e) => {
        e.stopPropagation()
        setIsRenaming(true)
      }}
      ref={dragDropTargetRef}
      style={{ opacity: isDraggingSource ? 0.5 : 1 }}
    >
      {isRenaming && (
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const updatedName = formData.get('name') as string
            await updateTemplateName.mutateAsync({ template: props.template, name: updatedName })
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
            defaultValue={props.template.name}
          />
        </form>
      )}

      {!isRenaming && (
        <>
          {props.template.name}
          <button onClick={() => removeTemplate.mutate({ template: props.template })}>del</button>
          <span ref={dragDropSourceRef}>move</span>
        </>
      )}

      <DropIndicator closestEdge={closestEdge} variant="horizontal" />
      <DragPreview dragPreviewContainer={dragPreviewContainer}>Move {props.template.name} ↕</DragPreview>
    </li>
  )
}
