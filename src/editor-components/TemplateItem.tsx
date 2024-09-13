import './TemplateItem.css'
import { type Template } from '../db'
import { useDragDrop } from '../utils/useDragDrop'
import { useRef } from 'react'
import { DropIndicator } from './DropIndicator'
import { DragPreview } from './DragPreview'

export function TemplateItem(props: { template: Template; index: number; isCanvasUpdatePending: boolean }) {
  const dragDropSourceRef = useRef<HTMLLIElement>(null)
  const dragDropTargetRef = useRef<HTMLLIElement>(null)

  const { isDraggingSource, closestEdge, dragPreviewContainer } = useDragDrop({
    dragRef: dragDropSourceRef,
    dropRef: dragDropTargetRef,
    disableDrag: props.isCanvasUpdatePending,
    data: { id: 'templateDragDrop', index: props.index, node: props.template },
  })

  return (
    <li data-component="TemplateItem" ref={dragDropTargetRef} style={{ opacity: isDraggingSource ? 0.5 : 1 }}>
      {props.template.name}
      <span ref={dragDropSourceRef}>move</span>
      <DropIndicator closestEdge={closestEdge} variant="horizontal" />
      <DragPreview dragPreviewContainer={dragPreviewContainer}>Move {props.template.name} ↕</DragPreview>
    </li>
  )
}
