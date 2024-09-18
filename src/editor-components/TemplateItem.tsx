import './TemplateItem.css'
import { type Template } from '../db'
import { useDragDrop } from '../utils/useDragDrop'
import { useEffect, useRef, useState } from 'react'
import { DropIndicator } from './DropIndicator'
import { DragPreview } from './DragPreview'
import { useTemplateDelete } from '../utils/useTemplateDelete'
import { useTemplateUpdateName } from '../utils/useTemplateUpdateName'

export function TemplateItem(props: { template: Template; index: number; isCanvasUpdatePending: boolean }) {
  const dragDropSourceRef = useRef<HTMLLIElement>(null)
  const dragDropTargetRef = useRef<HTMLLIElement>(null)
  const [isRenaming, setIsRenaming] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const templateDelete = useTemplateDelete()
  const templateUpdateName = useTemplateUpdateName()

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

  const { isDraggingSource, closestEdge, dragPreviewContainer } = useDragDrop({
    dragRef: dragDropSourceRef,
    dropRef: dragDropTargetRef,
    disableDrag: props.isCanvasUpdatePending,
    disableDrop: ({ source, element }) => source.data.id === 'componentItem' && element.getAttribute('data-component') === 'TemplateItem',
    data: { id: 'templateDragDrop', index: props.index, node: props.template },
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
            await templateUpdateName.mutateAsync({ template: props.template, name: updatedName })
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
          <button onClick={() => templateDelete.mutate({ template: props.template })}>del</button>
          <span ref={dragDropSourceRef}>move</span>
        </>
      )}

      <DropIndicator closestEdge={closestEdge} variant="horizontal" />
      <DragPreview dragPreviewContainer={dragPreviewContainer}>Move {props.template.name} ↕</DragPreview>
    </li>
  )
}
