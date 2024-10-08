import { Trash, Pen, Layout, Copy } from 'lucide-react'
import { useBlockDelete } from '@/hooks/use-block-delete'
import { useBlockCopy } from '@/hooks/use-block-copy'
import { useTemplateAdd } from '@/hooks/use-template-add'
import { Block, Page } from '@/db'
import { ComponentProps, Dispatch, SetStateAction } from 'react'
import { Active } from '@/routes/pages.$id'
import { Actions } from '@/components/editor/actions'
import { useIsMutating } from '@tanstack/react-query'

export function useBlockActions(props: {
  block: Block
  index: number
  parent: { slot: string; node: Block } | { slot: string; node: Page }
  setIsRenaming: Dispatch<SetStateAction<boolean>>
  isRenaming?: boolean
  setActive: Active['Set']
  isActive: boolean
}): ComponentProps<typeof Actions> {
  const { blockCopy } = useBlockCopy()
  const { blockDelete } = useBlockDelete()
  const { templateAdd } = useTemplateAdd()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))

  const operations: ComponentProps<typeof Actions>['operations'] = [
    {
      id: 'createTemplate',
      label: 'Create template',
      icon: Layout,
      shortcut: {
        label: '⇧⌥T',
        modifiers: ['ctrlKey', 'shiftKey'],
        key: 'T',
      },
      action: () => {
        templateAdd.mutate({ source: { id: 'block', index: props.index, node: props.block, parent: props.parent } })
      },
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: Copy,
      shortcut: {
        label: '⇧⌥D',
        modifiers: ['ctrlKey', 'shiftKey'],
        key: 'D',
      },
      action: () => {
        blockCopy.mutate({ index: props.index, id: props.block.id, parent: props.parent })
      },
    },
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
      disabled: props.isRenaming,
      shortcut: {
        key: 'Backspace',
        label: '⌫',
      },
      action: async () => {
        await blockDelete.mutateAsync({ index: props.index, blockId: props.block.id, parent: props.parent })
        props.setActive(undefined)
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

  return {
    operations,
    disableMenu: isCanvasMutating,
    disableShortcuts: !props.isActive || props.isRenaming || isCanvasMutating,
    label: 'Layer actions',
  }
}
