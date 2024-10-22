import { Trash, Pen, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '../ui/dropdown-menu'
import { useIsMutating } from '@tanstack/react-query'
import { Template } from '@/db'
import { useTreeItem } from '../ui/tree'
import { useActive } from '@/hooks/use-active'
import { useTemplateDelete } from '@/hooks/use-template-delete'

export function TemplateItemActions(props: { template: Template }) {
  const { templateDelete } = useTemplateDelete()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
  const { setRenaming } = useTreeItem()
  const { setActive } = useActive()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={isCanvasMutating} className="shrink-0 stroke-gray-400 hover:enabled:stroke-gray-900">
        <MoreHorizontal size={16} className="stroke-inherit" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Template actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setRenaming(true)
          }}
        >
          <Pen size={14} className="stroke-gray-400 mr-2" /> Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            templateDelete({ template: props.template })
            setActive(undefined)
          }}
        >
          <Trash size={14} className="stroke-gray-400 mr-2" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
