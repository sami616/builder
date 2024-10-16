import { MoreVertical, Trash, Layout, Copy } from 'lucide-react'
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '../ui/dropdown-menu'
import { useBlockDelete } from '@/hooks/use-block-delete'
import { useBlockCopy } from '@/hooks/use-block-copy'
import { useTemplateAdd } from '@/hooks/use-template-add'
import { useIsMutating } from '@tanstack/react-query'
import { Block } from '@/db'
import { ComponentProps } from 'react'
import { BlockLayerItem } from './block-layer-item'
import { useActive } from '@/hooks/use-active'

type BlockLayerItemProps = ComponentProps<typeof BlockLayerItem>

export function BlockLayerItemActions(props: { block: Block; index: BlockLayerItemProps['index']; parent: BlockLayerItemProps['parent'] }) {
  const { blockCopy } = useBlockCopy()
  const { blockDelete } = useBlockDelete()
  const { templateAdd } = useTemplateAdd()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
  const { setActive } = useActive()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={isCanvasMutating} className="shrink-0 opacity-40 enabled:hover:opacity-100">
        <MoreVertical size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Layer actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            templateAdd({ source: { id: 'block', index: props.index, node: props.block, parent: props.parent } })
          }}
        >
          <Layout size={14} className="opacity-40 mr-2" /> Create template
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            blockCopy({ index: props.index, id: props.block.id, parent: props.parent })
          }}
        >
          <Copy size={14} className="opacity-40 mr-2" /> Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            await blockDelete({ index: props.index, blockId: props.block.id, parent: props.parent })
            setActive(undefined)
          }}
        >
          <Trash size={14} className="opacity-40 mr-2" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
