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
import { Layout } from 'lucide-react'

export function TemplateItem(props: { template: Template; index: number }) {
  const dragRef = useRef<HTMLDivElement>(null)
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
      className={[
        'cursor-move',
        'select-none',
        'grid',
        'gap-2',
        'p-2',
        'text-sm',
        'hover:bg-muted',
        isDraggingSource ? 'opacity-50' : 'opacity-100',
      ].join(' ')}
      data-component="TemplateItem"
      ref={dropRef}
    >
      <div ref={dragRef} className="group flex gap-2 items-center justify-between w-full">
        <div className="grow flex items-center gap-2">
          <Layout size={14} className={['stroke-emerald-500'].join(' ')} />
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
              onDoubleClick={(e) => {
                e.stopPropagation()
                setIsRenaming(true)
              }}
            >
              {props.template.name}
            </span>
          )}
        </div>
      </div>
      <DropIndicator closestEdge={closestEdge} variant="horizontal" />
      <DragPreview dragPreviewContainer={dragPreviewContainer}>Move {props.template.name} ↕</DragPreview>
    </li>
  )
}
