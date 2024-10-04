import { Action } from '@/components/ui/tree'
import { Trash, Pen } from 'lucide-react'
import { Block, Template } from '@/db'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { useTemplateDelete } from './useTemplateDelete'

export function useTemplateActions(props: {
  template: Template
  setActiveBlockId: Dispatch<SetStateAction<Block['id'] | undefined>>
  setIsRenaming: Dispatch<SetStateAction<boolean>>
  isActiveBlock: boolean
}) {
  const { templateDelete } = useTemplateDelete()

  const templateActions: Array<Action> = [
    {
      id: 'rename',
      label: 'Rename',
      shortcut: {
        label: '⇧⌥R',
        modifiers: ['ctrlKey', 'shiftKey'],
        key: 'R',
      },
      icon: Pen,
      action: () => {
        props.setIsRenaming(true)
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      shortcut: {
        key: 'Backspace',
        label: '⌫',
      },
      icon: Trash,
      action: async () => {
        templateDelete.mutate({ template: props.template })
      },
    },
    {
      id: 'deselect',
      label: 'Deselect',
      shortcut: {
        key: 'Escape',
        label: 'ESC',
      },
      icon: Trash,
      action: async () => {
        props.setActiveBlockId(undefined)
      },
    },
  ]

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (!props.isActiveBlock) return
      for (const action of templateActions) {
        const { shortcut, action: performAction } = action
        const isShortcutPressed = shortcut.modifiers ? shortcut.modifiers?.every((key) => e[key]) && shortcut.key === e.key : shortcut.key === e.key
        if (isShortcutPressed) {
          e.preventDefault()
          performAction()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [props.isActiveBlock, templateActions])

  return { templateActions }
}
