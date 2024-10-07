import { ComponentType, useEffect } from 'react'

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

export function useKeyboard(props: { actions: Actions; bindListeners?: boolean }) {
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      for (const action of props.actions) {
        const { shortcut, disabled, action: performAction } = action
        if (!shortcut) continue
        if (disabled) continue
        const isShortcutPressed = shortcut.modifiers ? shortcut.modifiers?.every((key) => e[key]) && shortcut.key === e.key : shortcut.key === e.key
        if (isShortcutPressed) {
          e.preventDefault()
          performAction()
        }
      }
    }
    if (props.bindListeners) {
      window.addEventListener('keydown', handleKeyDown)
    } else {
      window.removeEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [props.bindListeners, props.actions])
}
