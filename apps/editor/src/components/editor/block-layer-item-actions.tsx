import { BlockDialogAddTemplate } from '#components/editor/block-dialog-add-template.tsx'
import { BlockDialogAdd } from '#components/editor/block-dialog-add.tsx'
import { validateSlotMax } from '#components/editor/block-layer-item-slot.tsx'
import { BlockLayerItem } from '#components/editor/block-layer-item.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '#components/ui/dropdown-menu.tsx'
import { type DBStores } from '@repo/lib'
import { useActive } from '#hooks/use-active.tsx'
import { useBlockCopy } from '#hooks/use-block-copy.ts'
import { useBlockDelete } from '#hooks/use-block-delete.ts'
import { useIsMutating } from '@tanstack/react-query'
import { Copy, Layout, MoreHorizontal, Plus, Trash } from 'lucide-react'
import { ComponentProps, Dispatch, ReactNode, SetStateAction, useRef, useState } from 'react'

type BlockLayerItemProps = ComponentProps<typeof BlockLayerItem>

export function BlockLayerItemActions(props: {
  actionsOpen: boolean
  setActionsOpen: Dispatch<SetStateAction<boolean>>
  block: DBStores['Block']
  trigger?: ReactNode
  index: BlockLayerItemProps['index']
  parent: BlockLayerItemProps['parent']
}) {
  const { blockCopy } = useBlockCopy()
  const { blockDelete } = useBlockDelete()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
  const { setActive } = useActive()
  const [blockAddOpen, setBlockAddOpen] = useState(false)
  const [templateAddOpen, setTemplateAddOpen] = useState(false)
  const actionsRef = useRef<HTMLDivElement>(null)

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
      <DropdownMenu
        open={props.actionsOpen}
        onOpenChange={(bool) => {
          props.setActionsOpen(bool)
          if (bool) {
            setActive({ store: 'blocks', items: [{ ...props.block, index: props.index, parent: props.parent }] })
          } else {
            setActive({ store: 'none', items: [] })
          }
        }}
      >
        <DropdownMenuTrigger disabled={isCanvasMutating} className="shrink-0 stroke-gray-400 hover:enabled:stroke-gray-900">
          {props.trigger ? props.trigger : <MoreHorizontal size={16} className="stroke-inherit" />}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          ref={actionsRef}
          onMouseOver={(e) => e.stopPropagation()}
          onMouseOut={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="w-56"
          align="start"
        >
          <DropdownMenuLabel>Layer actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={disableAdd()}
            onClick={() => {
              setBlockAddOpen(true)
            }}
          >
            <Plus size={14} className="stroke-gray-400 mr-2" />
            Add
            <DropdownMenuShortcut>A</DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              blockCopy({ index: props.index, id: props.block.id, parent: props.parent })
            }}
          >
            <Copy size={14} className="stroke-gray-400 mr-2" /> Duplicate
            <DropdownMenuShortcut>D</DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setTemplateAddOpen(true)
            }}
          >
            <Layout size={14} className="stroke-gray-400 mr-2" /> Create template
            <DropdownMenuShortcut>T</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => {
              blockDelete({ index: props.index, id: props.block.id, parent: props.parent })
            }}
          >
            <Trash size={14} className="mr-2" /> Delete
            <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BlockDialogAddTemplate open={templateAddOpen} setOpen={setTemplateAddOpen} block={props.block} parent={props.parent} index={props.index} />
      <BlockDialogAdd open={blockAddOpen} setOpen={setBlockAddOpen} parent={props.parent} index={props.index} />
    </>
  )
}
