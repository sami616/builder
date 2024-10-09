import { type Template } from '@/db'
import { Layout } from 'lucide-react'
import { useRef } from 'react'
import { useTemplateUpdateName } from '@/hooks/use-template-update-name'
import { useTemplateAdd } from '@/hooks/use-template-add'
import { useTemplateReorder } from '@/hooks/use-template-reorder'
import { useDrag, isDragData } from '@/hooks/use-drag'
import { useDrop } from '@/hooks/use-drop'
import { Fold, FoldHead, FoldIcon, FoldLabel } from '@/components/ui/tree'
import { useActive } from './active-provider'
import { DropIndicator } from './drop-indicator'
import { DragPreview } from './drag-preview'
import clsx from 'clsx'
import { TemplateItemActions } from './template-item-actions'

export function TemplateItem(props: { template: Template; index: number }) {
  const dragRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLLIElement>(null)
  const { templateUpdateName } = useTemplateUpdateName()
  const { templateAdd } = useTemplateAdd()
  const { templateReorder } = useTemplateReorder()
  const { dragPreviewContainer, isDraggingSource } = useDrag({ dragRef, data: { id: 'template', index: props.index, node: props.template } })
  const { setActive, isActive } = useActive()
  const currActive = isActive({ id: props.template.id, store: 'templates' })

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
    <Fold
      customRef={dropRef}
      htmlProps={{
        className: clsx([isDraggingSource && 'opacity-50', currActive && 'ring-inset ring-2 ring-emerald-500']),
        onClick: () => {
          setActive((active) => {
            if (active?.id === props.template.id) return undefined
            return { store: 'templates', id: props.template.id }
          })
        },
      }}
    >
      <FoldHead customRef={dragRef}>
        <FoldIcon icon={Layout} />
        <FoldLabel
          onRename={async (updatedName) => {
            await templateUpdateName.mutateAsync({ template: props.template, name: updatedName })
          }}
          label={props.template.name}
        />
        <TemplateItemActions template={props.template} />
      </FoldHead>
      <DropIndicator closestEdge={closestEdge} variant="horizontal" />
      <DragPreview dragPreviewContainer={dragPreviewContainer}>{props.template.name}</DragPreview>
    </Fold>
  )
}
