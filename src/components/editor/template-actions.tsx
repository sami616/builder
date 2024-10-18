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
import { Dispatch, ReactNode, SetStateAction } from 'react'
import { useActive } from '@/hooks/use-active'
import { useTemplateDelete } from '@/hooks/use-template-delete'

export function TemplateActions(props: {
  actionsOpen: boolean
  setActionsOpen: Dispatch<SetStateAction<boolean>>
  template: Template
  trigger?: ReactNode
}) {
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
  const { setActive, isActive } = useActive()
  const { templateDelete } = useTemplateDelete()

  const isActiveTemplate = isActive({ store: 'templates', id: props.template.id })

  return (
    <DropdownMenu
      open={props.actionsOpen}
      onOpenChange={(bool) => {
        props.setActionsOpen(bool)
      }}
    >
      <DropdownMenuTrigger asChild disabled={isCanvasMutating} className="shrink-0 opacity-40 enabled:hover:opacity-100">
        {props.trigger ? props.trigger : <MoreHorizontal size={16} className="shrink-0 opacity-40 enabled:hover:opacity-100" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()} className="w-56" align="start">
        <DropdownMenuLabel>Template actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await templateDelete({ template: props.template })
            if (isActiveTemplate) setActive(undefined)
          }}
        >
          <Trash size={14} className="opacity-40 mr-2" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
