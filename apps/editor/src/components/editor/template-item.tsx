import { DragPreview } from '#components/editor/drag-preview.tsx'
import { DropIndicator } from '#components/editor/drop-indicator.tsx'
import { TemplateItemActions } from '#components/editor/template-item-actions.tsx'
import { TreeItem, TreeItemHead, TreeItemLabel } from '#components/ui/tree.tsx'
import { type Template } from '#db.ts'
import { useActive } from '#hooks/use-active.tsx'
import { isDragData, useDrag } from '#hooks/use-drag.ts'
import { useDrop } from '#hooks/use-drop.ts'
import { useTemplateAdd } from '#hooks/use-template-add.ts'
import { useTemplateReorder } from '#hooks/use-template-reorder.ts'
import { useTemplateUpdateName } from '#hooks/use-template-update-name.ts'
import clsx from 'clsx'
import { useRef, useState } from 'react'

export function TemplateItem(props: { template: Template; index: number }) {
  const dragRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLLIElement>(null)
  const { templateUpdateName } = useTemplateUpdateName()
  const { templateAdd } = useTemplateAdd()
  const { templateReorder } = useTemplateReorder()
  const { dragPreviewContainer, isDraggingSource } = useDrag({ dragRef, data: { id: 'template', index: props.index, node: props.template } })
  const [actionsOpen, setActionsOpen] = useState(false)
  const { isActive, handleActiveClick } = useActive()
  const isActiveTemplate = isActive({ store: 'templates', item: props.template })

  const { closestEdge } = useDrop({
    dropRef,
    disableDrop: ({ source }) => isDragData['component'](source.data),
    data: { index: props.index, node: props.template },
    onDrop: ({ source, target }) => {
      if (isDragData['block'](source.data)) {
        templateAdd({ source: source.data, target: target.data })
      }
      if (isDragData['template'](source.data)) {
        templateReorder({ source: source.data, target: target.data })
      }
    },
  })

  return (
    <TreeItem
      customRef={dropRef}
      htmlProps={{
        onClick: (e) => {
          e.stopPropagation()
          handleActiveClick({ metaKey: e.metaKey, store: 'templates', item: props.template })
        },
        className: clsx([
          isDraggingSource && 'opacity-50',
          'outline',
          'outline-2',
          '-outline-offset-2',
          'outline-none',
          isActiveTemplate && 'outline-rose-500 hover:outline-rose-600',
        ]),
      }}
    >
      <TreeItemHead customRef={dragRef}>
        <TreeItemLabel
          onRename={async (updatedName) => {
            return templateUpdateName({ template: props.template, name: updatedName })
          }}
          label={props.template.name}
        />
        <TemplateItemActions template={props.template} setActionsOpen={setActionsOpen} actionsOpen={actionsOpen} />
      </TreeItemHead>
      <DropIndicator closestEdge={closestEdge} variant="horizontal" />
      <DragPreview dragPreviewContainer={dragPreviewContainer}>{props.template.name}</DragPreview>
    </TreeItem>
  )
}
