import { useHotkeys } from 'react-hotkeys-hook'
import { useActive } from './use-active'
import { useBlockDelete } from './use-block-delete'
import { useTemplateDelete } from './use-template-delete'
import { useTemplateDeleteMany } from './use-template-delete-many'
import { isBlock, isTemplate } from '@/api'
import { useBlockCopy } from './use-block-copy'
import { useBlockDeleteMany } from './use-block-delete-many'

export function useShortcuts() {
  const { active, setActive } = useActive()
  const { blockDelete } = useBlockDelete()
  const { blockDeleteMany } = useBlockDeleteMany()
  const { blockCopy } = useBlockCopy()
  const { templateDelete } = useTemplateDelete()
  const { templateDeleteMany } = useTemplateDeleteMany()

  const sortedActive = Object.groupBy(active, (a) => a.store)

  useHotkeys(
    'ctrl+d',
    async () => {
      if (sortedActive.blocks) {
        for (const key in sortedActive.blocks) {
          const block = sortedActive.blocks[key]
          if (isBlock(block)) {
            blockCopy({ id: block.id, index: block.meta.index, parent: block.meta.parent })
          }
        }
      }
    },
    { enableOnFormTags: true },
  )

  useHotkeys(
    'backspace',
    async () => {
      console.log('called')
      if (sortedActive.templates) {
        if (sortedActive.templates.length === 1) {
          const [template] = sortedActive.templates
          if (isTemplate(template)) {
            await templateDelete({ template })
          }
        }
        if (sortedActive.templates.length > 1) {
          await templateDeleteMany({ entries: sortedActive.templates })
        }
      }

      if (sortedActive.blocks) {
        if (sortedActive.blocks.length === 1) {
          const [block] = sortedActive.blocks
          if (isBlock(block)) {
            await blockDelete({ blockId: block.id, index: block.meta.index, parent: block.meta.parent })
            setActive([])
          }
        }
        if (sortedActive.blocks.length > 1) {
          await blockDeleteMany({
            entries: sortedActive.blocks.map((block) => ({ blockId: block.id, parent: block.meta.parent, index: block.meta.index })),
          })
          setActive([])
        }
      }
    },
    { enableOnFormTags: true },
  )
}
