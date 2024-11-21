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
import { useTemplateDelete } from '#hooks/use-template-delete.ts'
import { useIsMutating } from '@tanstack/react-query'
import { MoreHorizontal, Trash } from 'lucide-react'
import { type Dispatch, type SetStateAction } from 'react'

export function TemplateItemActions(props: {
  template: DBStores['Template']
  actionsOpen: boolean
  setActionsOpen: Dispatch<SetStateAction<boolean>>
}) {
  const { templateDelete } = useTemplateDelete()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
  const { setActive } = useActive()

  return (
    <DropdownMenu
      open={props.actionsOpen}
      onOpenChange={(bool) => {
        props.setActionsOpen(bool)
        if (bool) {
          setActive({ store: 'templates', items: [props.template] })
        } else {
          setActive({ store: 'none', items: [] })
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
          <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
