import { createPortal } from 'react-dom'
import { type ReactNode } from 'react'
import { Card, CardTitle } from '@/components/ui/card'

export function DragPreview(props: { dragPreviewContainer: HTMLElement | null; children: ReactNode }) {
  if (!props.dragPreviewContainer) return null

  return (
    <>
      {createPortal(
        <Card className="rounded-lg py-2 px-4">
          <CardTitle className="flex gap-2 font-normal text-sm items-center">{props.children}</CardTitle>
        </Card>,
        props.dragPreviewContainer,
      )}
    </>
  )
}
