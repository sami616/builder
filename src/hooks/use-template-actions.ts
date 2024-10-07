import { Trash, Pen } from 'lucide-react'
import { Template } from '@/db'
import { ComponentProps, Dispatch, SetStateAction } from 'react'
import { useTemplateDelete } from '@/hooks/use-template-delete'
import { Active } from '@/routes/pages.$id'
import { Actions } from '@/components/editor/actions'
import { useIsMutating } from '@tanstack/react-query'

export function useTemplateActions(props: {
  template: Template
  setIsRenaming: Dispatch<SetStateAction<boolean>>
  setActive: Active['Set']
  isActive: boolean
}): ComponentProps<typeof Actions> {
  {
    const { templateDelete } = useTemplateDelete()
    const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))

    const operations: ComponentProps<typeof Actions>['operations'] = [
      {
        id: 'rename',
        label: 'Rename',
        icon: Pen,
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
        label: 'Delete',
        icon: Trash,
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

    return { operations, disableMenu: isCanvasMutating, disableShortcuts: !props.isActive || isCanvasMutating, label: 'Layer actions' }
  }
}
