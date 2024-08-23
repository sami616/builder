import { createPortal } from 'react-dom'
import './DragPreview.css'
import { type ReactNode } from 'react'

export function DragPreview(props: {
  dragPreviewContainer: HTMLElement | null
  children: ReactNode
}) {
  if (!props.dragPreviewContainer) return null

  return createPortal(
    <div data-component="DragPreview">{props.children}</div>,
    props.dragPreviewContainer,
  )
}
