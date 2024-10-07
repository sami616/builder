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
import { useEffect, type ComponentType } from 'react'

export function Actions(props: {
  disableMenu?: boolean
  disableShortcuts?: boolean
  operations: Array<{
    id: string
    action: () => void
    disabled?: boolean
    label?: string
    icon?: ComponentType<{ className?: string; size?: number | string }>
    shortcut?: { label: string; modifiers?: Array<'ctrlKey' | 'shiftKey'>; key: string }
  }>
  label?: string
  onCloseAutoFocus?: (e: Event) => void
}) {
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      for (const op of props.operations) {
        const { shortcut, disabled, action: performAction } = op
        if (!shortcut) continue
        if (disabled) continue
        const isShortcutPressed = shortcut.modifiers ? shortcut.modifiers?.every((key) => e[key]) && shortcut.key === e.key : shortcut.key === e.key
        if (isShortcutPressed) {
          e.preventDefault()
          performAction()
        }
      }
    }
    if (props.disableShortcuts) {
      window.removeEventListener('keydown', handleKeyDown)
    } else {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [props.disableShortcuts, props.operations])

  return (
    props.operations && (
      <DropdownMenu>
        <DropdownMenuTrigger className="shrink-0 opacity-40 enabled:hover:opacity-100" disabled={props.disableMenu}>
          <MoreVertical size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent onCloseAutoFocus={props.onCloseAutoFocus} className="w-56" align="start">
          {props.label && (
            <>
              <DropdownMenuLabel>{props.label}</DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}

          {props.operations.map((action) => {
            const ActionIcon = action.icon
            const actionIcon = ActionIcon ? <ActionIcon size={14} className="opacity-40 mr-2" /> : null
            if (!action.label) return null
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
                {actionIcon} {action.label}
                {action.shortcut && <DropdownMenuShortcut>{action.shortcut.label}</DropdownMenuShortcut>}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  )
}
