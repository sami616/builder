import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'
import { type ComponentType } from 'react'

export function Actions(props: { disabled?: boolean; actions?: Actions; label?: string; onCloseAutoFocus?: (e: Event) => void }) {
  // use keyboard here?
  return (
    props.actions && (
      <DropdownMenu>
        <DropdownMenuTrigger className="shrink-0 opacity-40 enabled:hover:opacity-100" disabled={props.disabled}>
          <MoreVertical size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent onCloseAutoFocus={props.onCloseAutoFocus} className="w-56" align="start">
          {props.label && (
            <>
              <DropdownMenuLabel>{props.label}</DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}

          {props.actions.map((action) => {
            if (!action.ui) return null
            const ActionIcon = action.ui?.icon
            const actionIcon = ActionIcon ? <ActionIcon size={14} className="opacity-40 mr-2" /> : null
            return (
              <DropdownMenuItem
                id={action.id}
                disabled={action.disabled}
                onClick={(e) => {
                  e.stopPropagation()
                  action.action()
                }}
                key={action.id}
              >
                {actionIcon} {action.ui?.label}
                {action.shortcut && <DropdownMenuShortcut>{action.shortcut.label}</DropdownMenuShortcut>}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  )
}

export type Actions = Array<{
  id: string
  action: () => void
  disabled?: boolean
  ui?: {
    label: string
    icon: ComponentType<{ className?: string; size?: number | string }>
  }
  shortcut?: { label: string; modifiers?: Array<'ctrlKey' | 'shiftKey'>; key: string }
}>
