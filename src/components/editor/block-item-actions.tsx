import { type Block, type Page } from '@/db'
import { useBlockCopy } from '@/hooks/use-block-copy'
import { useBlockDelete } from '@/hooks/use-block-delete'
import { validateSlotMax } from './block-layer-item-slot'
import { Copy, Layout, Plus, Trash } from 'lucide-react'
import { ContextMenuLabel, ContextMenuSeparator, ContextMenuContent, ContextMenuItem, ContextMenuShortcut } from '@/components/ui/context-menu'
import { useState } from 'react'
import { useRouteContext } from '@tanstack/react-router'
import { BlockDialogAdd } from './block-dialog-add'
import { BlockDialogAddTemplate } from './block-dialog-add-template'

export function BlockItemActions(props: { block: Block; index: number; parent: { slot: string; node: Block | Page } }) {
  const context = useRouteContext({ from: '/pages/$id' })
  const { blockCopy } = useBlockCopy()
  const { blockDelete } = useBlockDelete()
  const [blockAddOpen, setBlockAddOpen] = useState(false)
  const [templateAddOpen, setTemplateAddOpen] = useState(false)

  const isMissing = context.config[props.block.type] ? false : true

  function disableAdd() {
    try {
      validateSlotMax({ target: { parent: props.parent } })
      return false
    } catch (e) {
      return true
    }
  }
  return (
    <>
      <ContextMenuContent
        onClick={(e) => e.stopPropagation()}
        onMouseOut={(e) => e.stopPropagation()}
        onMouseOver={(e) => e.stopPropagation()}
        className="w-56"
      >
        <ContextMenuLabel>Layer actions</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => {
            setBlockAddOpen(true)
          }}
          disabled={disableAdd()}
        >
          <Plus size={14} className="mr-2 stroke-gray-400" /> Add component
          <ContextMenuShortcut>A</ContextMenuShortcut>
        </ContextMenuItem>
        {!isMissing && (
          <ContextMenuItem
            onClick={() => {
              blockCopy({ index: props.index, id: props.block.id, parent: props.parent })
            }}
          >
            <Copy size={14} className="mr-2 stroke-gray-400" />
            Duplicate
            <ContextMenuShortcut>D</ContextMenuShortcut>
          </ContextMenuItem>
        )}

        {!isMissing && (
          <ContextMenuItem
            onClick={() => {
              setTemplateAddOpen(true)
            }}
          >
            <Layout size={14} className="mr-2 stroke-gray-400" />
            Create template
            <ContextMenuShortcut>T</ContextMenuShortcut>
          </ContextMenuItem>
        )}
        <ContextMenuItem
          onClick={() => {
            blockDelete({ index: props.index, id: props.block.id, parent: props.parent })
          }}
          className="text-red-500"
        >
          <Trash size={14} className="mr-2" /> Delete
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
      <BlockDialogAdd open={blockAddOpen} setOpen={setBlockAddOpen} parent={props.parent} index={props.index} />
      <BlockDialogAddTemplate open={templateAddOpen} setOpen={setTemplateAddOpen} block={props.block} parent={props.parent} index={props.index} />
    </>
  )
}