import { type Template } from '@/db'
import { Layout } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTemplateUpdateName } from '@/hooks/use-template-update-name'
import { useTemplateAdd } from '@/hooks/use-template-add'
import { useTemplateReorder } from '@/hooks/use-template-reorder'
import { useDrag, isDragData } from '@/hooks/use-drag'
import { useDrop } from '@/hooks/use-drop'
import { TreeItem } from '@/components/ui/tree'
import { useTemplateActions } from '@/hooks/use-template-actions'
import { Active } from '@/routes/pages.$id'

export function TemplateItem(props: { template: Template; index: number; active: Active['State']; setActive: Active['Set'] }) {
  const dragRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLLIElement>(null)
  const { templateUpdateName } = useTemplateUpdateName()
  const { templateAdd } = useTemplateAdd()
  const { templateReorder } = useTemplateReorder()
  const { dragPreviewContainer, isDraggingSource } = useDrag({ dragRef, data: { id: 'template', index: props.index, node: props.template } })
  const [isRenaming, setIsRenaming] = useState(false)
  const isActive = props.active?.store === 'templates' && props.active.id === props.template.id
  const templateActions = useTemplateActions({ setIsRenaming, setActive: props.setActive, isActive, template: props.template })

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
    <TreeItem
      htmlProps={{ 'data-component': 'TemplateItem' }}
      label={props.template.name}
      icon={Layout}
      rename={{
        isRenaming,
        setIsRenaming,
        onRename: async (updatedName) => {
          await templateUpdateName.mutateAsync({ template: props.template, name: updatedName })
        },
      }}
      isActive={isActive}
      setActive={(e) => {
        e.stopPropagation()
        props.setActive((active) => {
          if (active?.id === props.template.id) return undefined
          return { store: 'templates', id: props.template.id }
        })
      }}
      actions={templateActions}
      drop={{ ref: dropRef, edge: closestEdge }}
      drag={{ ref: dragRef, isDragging: isDraggingSource, preview: { container: dragPreviewContainer, children: props.template.name } }}
    />
  )
}
