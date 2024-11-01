import { useHotkeys } from 'react-hotkeys-hook'
import { useActive } from './use-active'
import { useBlockDelete } from './use-block-delete'
import { useTemplateDelete } from './use-template-delete'
import { useTemplateDeleteMany } from './use-template-delete-many'
import { useBlockCopy } from './use-block-copy'
import { useBlockDeleteMany } from './use-block-delete-many'
import { useBlockCopyMany } from './use-block-copy-many'
import { isBlock, isTemplate } from '@/api'

export function useShortcuts() {
  const { active, setActive } = useActive()
  const { blockDelete } = useBlockDelete()
  const { blockDeleteMany } = useBlockDeleteMany()
  const { blockCopy } = useBlockCopy()
  const { blockCopyMany } = useBlockCopyMany()
  const { templateDelete } = useTemplateDelete()
  const { templateDeleteMany } = useTemplateDeleteMany()

  const sortedActive = {
    templates: active.filter((el) => isTemplate(el)),
    blocks: active.filter((el) => isBlock(el)),
  }

  useHotkeys('ctrl+d', async () => {
    if (sortedActive.blocks) {
      if (sortedActive.blocks.length === 1) {
        const [block] = sortedActive.blocks
        await blockCopy({ id: block.id, index: block.meta.index, parent: block.meta.parent })
      }
      if (sortedActive.blocks.length > 1) {
        await blockCopyMany({
          entries: sortedActive.blocks.map((block) => ({ id: block.id, parent: block.meta.parent, index: block.meta.index })),
        })
      }
    }
  })

  useHotkeys('backspace', async () => {
    if (sortedActive.templates) {
      if (sortedActive.templates.length === 1) {
        const [template] = sortedActive.templates
        await templateDelete({ template })
      }
      if (sortedActive.templates.length > 1) {
        await templateDeleteMany({ entries: sortedActive.templates })
      }
    }

    if (sortedActive.blocks) {
      if (sortedActive.blocks.length === 1) {
        const [block] = sortedActive.blocks
        await blockDelete({ blockId: block.id, index: block.meta.index, parent: block.meta.parent })
        setActive([])
      }
      if (sortedActive.blocks.length > 1) {
        await blockDeleteMany({
          entries: sortedActive.blocks.map((block) => ({ blockId: block.id, parent: block.meta.parent, index: block.meta.index })),
        })
        setActive([])
      }
    }
  })
}
