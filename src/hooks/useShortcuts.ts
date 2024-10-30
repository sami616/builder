import { useHotkeys } from 'react-hotkeys-hook'
import { useActive } from './use-active'
import { useBlockDelete } from './use-block-delete'
import { useTemplateDelete } from './use-template-delete'
import { isBlock, isTemplate } from '@/api'
import { useBlockCopy } from './use-block-copy'
import { useBlockDeleteMany } from './use-block-delete-many'

export function useShortcuts() {
  const { active } = useActive()
  const { blockDelete } = useBlockDelete()
  const { blockDeleteMany } = useBlockDeleteMany()
  const { blockCopy } = useBlockCopy()

  const { templateDelete } = useTemplateDelete()
  const sortedActive = Object.groupBy(active, (a) => a.store)

  useHotkeys('ctrl+d', async () => {
    if (sortedActive.blocks) {
      for (const key in sortedActive.blocks) {
        const block = sortedActive.blocks[key]
        // needed for ts becuase groupBy TS return type isnt clever enough
        if (isBlock(block)) {
          blockCopy({ id: block.id, index: block.meta.index, parent: block.meta.parent })
        }
      }
    }
  })

  useHotkeys('backspace', async () => {
    if (sortedActive.blocks) {
      if (sortedActive.blocks.length === 1) {
        const [block] = sortedActive.blocks
        if (isBlock(block)) {
          await blockDelete({ blockId: block.id, index: block.meta.index, parent: block.meta.parent })
        }
      }
      if (sortedActive.blocks.length > 1) {
        await blockDeleteMany({
          entries: sortedActive.blocks.map((block) => ({ blockId: block.id, parent: block.meta.parent, index: block.meta.index })),
        })
      }
    }
    if (sortedActive.templates) {
      for (const key in sortedActive.templates) {
        // needed for ts becuase groupBy TS return type isnt clever enough
        const template = sortedActive.templates[key]
        if (isTemplate(template)) {
          await templateDelete({ template })
        }
      }
    }
  })
}
