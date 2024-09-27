import { type Template } from '@/db'
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

export function TemplateItem(props: { template: Template; index: number }) {
  const dragRef = useRef<HTMLSpanElement>(null)
  const dropRef = useRef<HTMLLIElement>(null)
  const [isRenaming, setIsRenaming] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

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
    <li
      data-component="TemplateItem"
      onDoubleClick={(e) => {
        e.stopPropagation()
        setIsRenaming(true)
      }}
      ref={dropRef}
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
          <span ref={dragRef}>move</span>
        </>
      )}

      <DropIndicator closestEdge={closestEdge} variant="horizontal" />
      <DragPreview dragPreviewContainer={dragPreviewContainer}>Move {props.template.name} ↕</DragPreview>
    </li>
  )
}
