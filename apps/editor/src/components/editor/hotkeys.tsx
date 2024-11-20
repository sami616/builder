import { BlockDialogAddTemplate } from '#components/editor/block-dialog-add-template.tsx'
import { BlockDialogAdd } from '#components/editor/block-dialog-add.tsx'
import { BlockDialogDelete } from '#components/editor/block-dialog-delete.tsx'
import { TemplateDialogDelete } from '#components/editor/template-dialog-delete.tsx'
import { useActive } from '#hooks/use-active.tsx'
import { useBlockCopyMany } from '#hooks/use-block-copy-many.ts'
import { useBlockCopy } from '#hooks/use-block-copy.ts'
import { useBlockDelete } from '#hooks/use-block-delete.ts'
import { useTemplateDelete } from '#hooks/use-template-delete.ts'
import { type ReactNode } from '@tanstack/react-router'
import { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

export function HotKeys(props: { children: ReactNode }) {
  const { active } = useActive()
  const { blockCopy } = useBlockCopy()
  const { blockCopyMany } = useBlockCopyMany()
  const { blockDelete } = useBlockDelete()
  const { templateDelete } = useTemplateDelete()

  const [templateDeleteOpen, setTemplateDeleteOpen] = useState(false)
  const [blockDeleteOpen, setBlockDeleteOpen] = useState(false)
  const [blockAddOpen, setBlockAddOpen] = useState(false)
  const [templateAddOpen, setTemplateAddOpen] = useState(false)

  const activeBlocksSingle = active.store === 'blocks' && active.items.length === 1 ? active.items.at(0) : undefined
  const activeBlocksMany = active.store === 'blocks' && active.items.length > 1 ? active.items : undefined

  const activeTemplateSingle = active.store === 'templates' && active.items.length === 1 ? active.items.at(0) : undefined
  const activeTemplatesMany = active.store === 'templates' && active.items.length > 1 ? active.items : undefined

  useHotkeys('a', async () => {
    if (activeBlocksSingle) {
      setBlockAddOpen(true)
    }
  })

  useHotkeys('t', async () => {
    if (activeBlocksSingle) {
      setTemplateAddOpen(true)
    }
  })

  useHotkeys('d', async () => {
    if (activeBlocksSingle) {
      await blockCopy({ id: activeBlocksSingle.id, index: activeBlocksSingle.index, parent: activeBlocksSingle.parent })
    }
    if (activeBlocksMany) {
      await blockCopyMany({
        entries: activeBlocksMany.map((block) => ({ id: block.id, parent: block.parent, index: block.index })),
      })
    }
  })

  useHotkeys('backspace', async () => {
    if (activeTemplateSingle) {
      templateDelete({ template: activeTemplateSingle })
    }
    if (activeTemplatesMany) {
      setTemplateDeleteOpen(true)
    }
    if (activeBlocksSingle) {
      await blockDelete(activeBlocksSingle)
    }
    if (activeBlocksMany) {
      setBlockDeleteOpen(true)
    }
  })

  return (
    <>
      {props.children}
      {activeTemplatesMany && <TemplateDialogDelete open={templateDeleteOpen} setOpen={setTemplateDeleteOpen} templates={activeTemplatesMany} />}
      {activeBlocksMany && <BlockDialogDelete open={blockDeleteOpen} setOpen={setBlockDeleteOpen} blocks={activeBlocksMany} />}
      {activeBlocksSingle && (
        <>
          <BlockDialogAdd open={blockAddOpen} setOpen={setBlockAddOpen} parent={activeBlocksSingle.parent} index={activeBlocksSingle.index} />
          <BlockDialogAddTemplate
            open={templateAddOpen}
            setOpen={setTemplateAddOpen}
            block={activeBlocksSingle}
            parent={activeBlocksSingle.parent}
            index={activeBlocksSingle.index}
          />
        </>
      )}
    </>
  )
}
