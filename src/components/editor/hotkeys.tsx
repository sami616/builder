import { useHotkeys } from 'react-hotkeys-hook'
import { useActive } from '@/hooks/use-active'
import { useTemplateDelete } from '@/hooks/use-template-delete'
import { useTemplateDeleteMany } from '@/hooks/use-template-delete-many'
import { useBlockCopy } from '@/hooks/use-block-copy'
import { useBlockCopyMany } from '@/hooks/use-block-copy-many'
import { isBlock, isTemplate } from '@/api'
import { BlockDialogAdd } from './block-dialog-add'
import { BlockDialogAddTemplate } from './block-dialog-add-template'
import { useState } from 'react'
import { ReactNode } from '@tanstack/react-router'
import { BlockDialogDelete } from './block-dialog-delete'

export function HotKeys(props: { children: ReactNode }) {
  const { active } = useActive()
  const { blockCopy } = useBlockCopy()
  const { blockCopyMany } = useBlockCopyMany()
  const { templateDelete } = useTemplateDelete()
  const { templateDeleteMany } = useTemplateDeleteMany()

  const [blockDeleteOpen, setBlockDeleteOpen] = useState(false)
  const [blockAddOpen, setBlockAddOpen] = useState(false)
  const [templateAddOpen, setTemplateAddOpen] = useState(false)

  const sortedActive = {
    templates: active.filter((el) => isTemplate(el)),
    blocks: active.filter((el) => isBlock(el)),
  }

  const activeBlocksSingle = sortedActive.blocks.length === 1 ? sortedActive.blocks.at(0) : undefined
  const activeBlocksMany = sortedActive.blocks.length > 1 ? sortedActive.blocks : undefined

  const activeTemplateSingle = sortedActive.templates.length === 1 ? sortedActive.templates.at(0) : undefined
  const activeTemplatesMany = sortedActive.templates.length > 1 ? sortedActive.templates : undefined

  useHotkeys('ctrl+a', async () => {
    if (sortedActive.blocks) {
      if (activeBlocksSingle) {
        setBlockAddOpen(true)
      }
    }
  })

  useHotkeys('ctrl+t', async () => {
    if (sortedActive.blocks) {
      if (activeBlocksSingle) {
        setTemplateAddOpen(true)
      }
    }
  })
  useHotkeys('ctrl+d', async () => {
    if (sortedActive.blocks) {
      if (activeBlocksSingle) {
        await blockCopy({ id: activeBlocksSingle.id, index: activeBlocksSingle.meta.index, parent: activeBlocksSingle.meta.parent })
      }
      if (activeBlocksMany) {
        await blockCopyMany({
          entries: activeBlocksMany.map((block) => ({ id: block.id, parent: block.meta.parent, index: block.meta.index })),
        })
      }
    }
  })

  useHotkeys('backspace', async () => {
    if (sortedActive.templates) {
      if (activeTemplateSingle) {
        await templateDelete({ template: activeTemplateSingle })
      }
      if (activeTemplatesMany) {
        await templateDeleteMany({ entries: activeTemplatesMany })
      }
    }

    if (sortedActive.blocks) {
      setBlockDeleteOpen(true)
    }
  })

  return (
    <>
      {props.children}
      <BlockDialogDelete
        open={blockDeleteOpen}
        setOpen={setBlockDeleteOpen}
        blocks={sortedActive.blocks.map((block) => ({ id: block.id, index: block.meta.index, parent: block.meta.parent }))}
      />
      {activeBlocksSingle && (
        <>
          <BlockDialogAdd
            open={blockAddOpen}
            setOpen={setBlockAddOpen}
            parent={activeBlocksSingle.meta.parent}
            index={activeBlocksSingle.meta.index}
          />
          <BlockDialogAddTemplate
            open={templateAddOpen}
            setOpen={setTemplateAddOpen}
            block={activeBlocksSingle}
            parent={activeBlocksSingle.meta.parent}
            index={activeBlocksSingle.meta.index}
          />
        </>
      )}
    </>
  )
}
