import { Actions } from '@/hooks/use-keyboard'
import { Trash, Pen } from 'lucide-react'
import { Template } from '@/db'
import { Dispatch, SetStateAction } from 'react'
import { useTemplateDelete } from '@/hooks/use-template-delete'
import { Active } from '@/routes/pages.$id'

export function useTemplateActions(props: { template: Template; setIsRenaming: Dispatch<SetStateAction<boolean>>; setActive: Active['Set'] }) {
  const { templateDelete } = useTemplateDelete()

  const templateActions: Actions = [
    {
      id: 'rename',
      ui: {
        label: 'Rename',
        icon: Pen,
      },
      shortcut: {
        label: '⇧⌥R',
        modifiers: ['ctrlKey', 'shiftKey'],
        key: 'R',
      },
      action: () => {
        props.setIsRenaming(true)
      },
    },
    {
      id: 'delete',
      ui: {
        label: 'Delete',
        icon: Trash,
      },
      shortcut: {
        key: 'Backspace',
        label: '⌫',
      },
      action: async () => {
        templateDelete.mutate({ template: props.template })
      },
    },
    {
      id: 'deselect',
      shortcut: {
        key: 'Escape',
        label: 'ESC',
      },
      action: () => {
        props.setActive(undefined)
      },
    },
  ]

  return { templateActions }
}
