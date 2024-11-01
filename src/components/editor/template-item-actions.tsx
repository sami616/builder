import { Trash, MoreHorizontal } from 'lucide-react'
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
import { useActive } from '@/hooks/use-active'
import { useTemplateDelete } from '@/hooks/use-template-delete'
import { Dispatch, SetStateAction } from 'react'

export function TemplateItemActions(props: { template: Template; actionsOpen: boolean; setActionsOpen: Dispatch<SetStateAction<boolean>> }) {
  const { templateDelete } = useTemplateDelete()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
  const { setActive } = useActive()

  return (
    <DropdownMenu
      open={props.actionsOpen}
      onOpenChange={(bool) => {
        props.setActionsOpen(bool)
        if (bool) {
          setActive([props.template])
        } else {
          setActive([])
        }
      }}
    >
      <DropdownMenuTrigger disabled={isCanvasMutating} className="shrink-0 stroke-gray-400 hover:enabled:stroke-gray-900">
        <MoreHorizontal size={16} className="stroke-inherit" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Template actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-500"
          onClick={() => {
            templateDelete({ template: props.template })
          }}
        >
          <Trash size={14} className="mr-2" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
