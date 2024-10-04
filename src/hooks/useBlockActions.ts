import { Action } from '@/components/ui/tree'
import { Trash, Pen, Layout, Copy } from 'lucide-react'
import { useBlockDelete } from '@/hooks/useBlockDelete'
import { useBlockCopy } from '@/hooks/useBlockCopy'
import { useTemplateAdd } from '@/hooks/useTemplateAdd'
import { Block, Page } from '@/db'
import { Dispatch, SetStateAction, useEffect } from 'react'

export function useBlockActions(props: {
  block: Block
  index: number
  parent: { slot: string; node: Block } | { slot: string; node: Page }
  setActiveBlockId: Dispatch<SetStateAction<Block['id'] | undefined>>
  setIsRenaming: Dispatch<SetStateAction<boolean>>
  isActiveBlock: boolean
}) {
  const { blockCopy } = useBlockCopy()
  const { blockDelete } = useBlockDelete()
  const { templateAdd } = useTemplateAdd()

  const blockActions: Array<Action> = [
    {
      id: 'createTemplate',
      label: 'Create template',
      shortcut: {
        label: '⇧⌥T',
        modifiers: ['ctrlKey', 'shiftKey'],
        key: 'T',
      },
      icon: Layout,
      action: () => {
        templateAdd.mutate({ source: { id: 'block', index: props.index, node: props.block, parent: props.parent } })
      },
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      shortcut: {
        label: '⇧⌥D',
        modifiers: ['ctrlKey', 'shiftKey'],
        key: 'D',
      },
      icon: Copy,
      action: () => {
        blockCopy.mutate({ index: props.index, id: props.block.id, parent: props.parent })
      },
    },
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
        await blockDelete.mutateAsync({ index: props.index, blockId: props.block.id, parent: props.parent })
        props.setActiveBlockId(undefined)
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

      for (const action of blockActions) {
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
  }, [props.isActiveBlock, blockActions])

  return { blockActions }
}
