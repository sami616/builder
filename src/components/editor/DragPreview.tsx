import { createPortal } from 'react-dom'
import { type ReactNode } from 'react'
import { MoveUpRight } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/card'

export function DragPreview(props: { dragPreviewContainer: HTMLElement | null; children: ReactNode }) {
  if (!props.dragPreviewContainer) return null

  return createPortal(
    <Card className="rounded py-2 px-4">
      <CardTitle className="flex gap-2 font-normal text-sm items-center">
        {props.children} <MoveUpRight size={16} />
      </CardTitle>
    </Card>,
    props.dragPreviewContainer,
  )
}
