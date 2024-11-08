import { Info } from 'lucide-react'
import { Label } from '../ui/label'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Field } from '@/main'

export function PropInputLabel(props: { field: Field; for?: string }) {
  return (
    <Label htmlFor={props.for} className="flex gap-2 items-center">
      {props.field.name}
      {props.field.description && (
        <HoverCard>
          <HoverCardTrigger>
            <Info size={14} className="stroke-gray-500" />
          </HoverCardTrigger>
          <HoverCardContent>
            <p className="text-xs">{props.field.description}</p>
          </HoverCardContent>
        </HoverCard>
      )}
    </Label>
  )
}
