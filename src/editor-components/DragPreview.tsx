import { createPortal } from 'react-dom'
import { type ReactNode } from 'react'

export function DragPreview(props: { dragPreviewContainer: HTMLElement | null; children: ReactNode }) {
  if (!props.dragPreviewContainer) return null

  return createPortal(<div data-component="DragPreview">{props.children}</div>, props.dragPreviewContainer)
}
