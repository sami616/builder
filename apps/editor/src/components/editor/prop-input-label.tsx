import { ConfigProps } from '@repo/lib'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '#components/ui/hover-card.tsx'
import { Label } from '#components/ui/label.tsx'
import clsx from 'clsx'
import { Info } from 'lucide-react'

export function PropInputLabel(props: { field: ConfigProps[keyof ConfigProps]; for?: string; variant?: 'head' | 'subhead' }) {
  if (!props.field.name) return null
  return (
    <Label htmlFor={props.for} className={clsx(`flex gap-2 items-center`, props.variant === 'head' ? 'text-sm' : 'text-xs')}>
      {props.field.name}
      {props.field.description && (
        <HoverCard>
          <HoverCardTrigger>
            <Info size={14} className="stroke-gray-500" />
          </HoverCardTrigger>
          <HoverCardContent className="w-fit max-w-60">
            <p className="text-xs">{props.field.description}</p>
          </HoverCardContent>
        </HoverCard>
      )}
    </Label>
  )
}
