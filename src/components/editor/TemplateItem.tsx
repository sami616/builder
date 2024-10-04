import { type Template } from '@/db'
import { Layout } from 'lucide-react'
import { isDragData } from '@/hooks/useDrag'
import { useRef, useState } from 'react'
import { useTemplateUpdateName } from '@/hooks/useTemplateUpdateName'
import { useTemplateAdd } from '@/hooks/useTemplateAdd'
import { useTemplateReorder } from '@/hooks/useTemplateReorder'
import { useDrag } from '@/hooks/useDrag'
import { useDrop } from '@/hooks/useDrop'
import { Tree } from '../ui/tree'
import { useIsMutating } from '@tanstack/react-query'
import { useTemplateActions } from '@/hooks/useTemplateActions'

export function TemplateItem(props: { template: Template; index: number }) {
  const dragRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLLIElement>(null)
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
  const { templateUpdateName } = useTemplateUpdateName()
  const { templateAdd } = useTemplateAdd()
  const { templateReorder } = useTemplateReorder()
  const { dragPreviewContainer, isDraggingSource } = useDrag({ dragRef, data: { id: 'template', index: props.index, node: props.template } })
  const [isRenaming, setIsRenaming] = useState(false)
  const { templateActions } = useTemplateActions({ setIsRenaming, isActiveBlock: false, setActiveBlockId: () => {}, template: props.template })

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
      item={{
        label: props.template.name,
        icon: Layout,
      }}
      rename={{
        isRenaming,
        setIsRenaming,
        onRename: async (updatedName) => {
          await templateUpdateName.mutateAsync({ template: props.template, name: updatedName })
        },
      }}
      action={{
        label: 'Template actions',
        disabled: isCanvasMutating,
        items: templateActions,
      }}
      drop={{ ref: dropRef, edge: closestEdge }}
      drag={{ ref: dragRef, isDragging: isDraggingSource, preview: { container: dragPreviewContainer, children: props.template.name } }}
    />
  )
}
