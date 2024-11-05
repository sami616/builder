import { Info } from 'lucide-react'
import { Label } from '../ui/label'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Props } from '@/main'

export function PropInputLabel(props: { prop: Props[keyof Props]; propKey: string }) {
  return (
    <Label htmlFor={props.propKey} className="flex gap-2 items-center">
      {props.prop.name}
      {props.prop.description && (
        <HoverCard>
          <HoverCardTrigger>
            <Info size={14} className="stroke-gray-500" />
          </HoverCardTrigger>
          <HoverCardContent>
            <p className="text-xs">{props.prop.description}</p>
          </HoverCardContent>
        </HoverCard>
      )}
    </Label>
  )
}
