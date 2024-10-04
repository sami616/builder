import { Dispatch, HTMLProps, RefObject, SetStateAction, ComponentType, useEffect, useRef } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'
import { ChevronDown, ChevronRight, MoreVertical } from 'lucide-react'
import { DropIndicator } from '../editor/DropIndicator'
import { Edge } from '@/hooks/useDrop'
import { ReactNode } from '@tanstack/react-router'
import { DragPreview } from '../editor/DragPreview'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from './dropdown-menu'

export type Action = {
  label: string
  id: string
  icon: ComponentType<{ className?: string; size?: number | string }>
  action: () => void
  shortcut: { label: string; modifiers?: Array<'ctrlKey' | 'shiftKey'>; key: string }
}

export function Tree(props: {
  item: {
    label?: string
    icon?: ComponentType<{ className?: string; size?: number | string }>
  }
  items?: JSX.Element[]
  drop?: { isDraggingOver?: boolean; ref: RefObject<HTMLLIElement>; edge?: Edge }
  drag?: { isDragging?: boolean; ref: RefObject<HTMLDivElement>; preview: { container: HTMLElement | null; children: ReactNode } }
  open?: boolean
  rename?: { isRenaming: boolean; setIsRenaming: Dispatch<SetStateAction<boolean>>; onRename: (updatedName: string) => void }
  setOpen?: Dispatch<SetStateAction<boolean>>
  li?: HTMLProps<HTMLLIElement> & Record<`data-${string}`, any>
  isHovered?: boolean
  onCloseAutoFocus?: (e: Event) => void
  action?: {
    items: Array<Action>
    label: string
    disabled: boolean
  }
  isActive?: boolean
  setActive?: (e: React.MouseEvent<HTMLDivElement>) => any
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function handleClickOutside(e: MouseEvent) {
      if (props.rename?.isRenaming && inputRef.current && !inputRef.current.contains(e.target as Node)) {
        props.rename.onRename(inputRef.current.value)
        props.rename?.setIsRenaming(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [props.rename?.isRenaming])

  function selectInput() {
    inputRef.current?.select()
    inputRef.current?.focus()
  }
  useEffect(() => {
    if (props.rename?.isRenaming) {
      selectInput()
    }
  }, [props.rename?.isRenaming])

  const ItemIcon = props.item.icon
  const itemIcon = ItemIcon ? <ItemIcon size={14} className="stroke-emerald-500" /> : null

  if (!props.items?.length)
    return (
      <li
        {...props.li}
        className={[
          'select-none',
          'grid',
          'gap-2',
          'p-2',
          'text-sm',
          props.isHovered ? 'bg-gray-100' : '',
          props.drag?.isDragging ? 'opacity-50' : 'opacity-100',
          props.drop?.isDraggingOver ? 'bg-gray-100' : '',
          props.isActive && 'ring-inset ring-2 ring-emerald-500',
          props.li?.className,
        ].join(' ')}
        ref={props.drop?.ref}
      >
        <div className="flex gap-2 grow">
          <div
            onClick={props.setActive}
            ref={props.drag?.ref}
            className={`${props.drag ? 'cursor-move' : 'cursor-default'} flex grow gap-2 items-center`}
          >
            {itemIcon}
            {props.rename?.isRenaming ? (
              <form
                className="grow"
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const updatedName = formData.get('name') as string
                  props.rename?.onRename(updatedName)
                  props.rename?.setIsRenaming(false)
                }}
              >
                <input
                  className="focus:bg-gray-200 p-1 rounded focus:outline-none w-full bg-transparent"
                  ref={inputRef}
                  name="name"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      props.rename?.setIsRenaming(false)
                    }
                  }}
                  defaultValue={props.item.label}
                />
              </form>
            ) : (
              <span
                className="w-full p-1"
                onDoubleClick={(e) => {
                  e.stopPropagation()
                  props.rename?.setIsRenaming(true)
                }}
              >
                {props.item.label}
              </span>
            )}
            {props.action?.items && (
              <DropdownMenu>
                <DropdownMenuTrigger disabled={props.action.disabled}>
                  <MoreVertical size={16} className="shrink-0 opacity-40 hover:opacity-100" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  onCloseAutoFocus={(e) => {
                    if (props.rename?.isRenaming) {
                      e.preventDefault()
                      selectInput()
                    }
                  }}
                  className="w-56"
                  align="start"
                >
                  {props.action.label && (
                    <>
                      <DropdownMenuLabel>{props.action.label}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {props.action.items.map((action) => {
                    const Icon = action.icon
                    return (
                      <DropdownMenuItem onClick={() => action.action()} key={action.id}>
                        {<Icon className="opacity-40 mr-2" size={14} />} {action.label}
                        <DropdownMenuShortcut>{action.shortcut.label}</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        {props.drop?.edge && <DropIndicator closestEdge={props.drop.edge} variant="horizontal" />}
        {props.drag?.preview && <DragPreview dragPreviewContainer={props.drag.preview.container}>{props.drag.preview.children}</DragPreview>}
      </li>
    )

  return (
    <Collapsible asChild open={props.open} onOpenChange={props.setOpen}>
      <li
        {...props.li}
        ref={props.drop?.ref}
        className={[
          'select-none',
          'grid',
          'gap-2',
          'p-2',
          'text-sm',
          props.isHovered ? 'bg-gray-100' : '',
          props.drag?.isDragging ? 'opacity-50' : 'opacity-100',
          props.drop?.isDraggingOver ? 'bg-gray-100' : '',
          props.isActive && 'ring-inset ring-2 ring-emerald-500',
        ].join(' ')}
      >
        <div className="w-full flex gap-2 items-center">
          <CollapsibleTrigger className="cursor-pointer shrink-0 opacity-40 hover:opacity-100" asChild>
            {props.open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </CollapsibleTrigger>
          <div className="flex gap-2 grow">
            <div
              onClick={props.setActive}
              ref={props.drag?.ref}
              className={`${props.drag ? 'cursor-move' : 'cursor-default'} flex grow gap-2 items-center`}
            >
              {itemIcon}
              {props.rename?.isRenaming ? (
                <form
                  className="grow"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const updatedName = formData.get('name') as string
                    props.rename?.onRename(updatedName)
                    props.rename?.setIsRenaming(false)
                  }}
                >
                  <input
                    className="focus:bg-gray-200 p-1 rounded focus:outline-none w-full bg-transparent"
                    ref={inputRef}
                    name="name"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        props.rename?.setIsRenaming(false)
                      }
                    }}
                    defaultValue={props.item.label}
                  />
                </form>
              ) : (
                <span
                  className="w-full p-1"
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    props.rename?.setIsRenaming(true)
                  }}
                >
                  {props.item.label}
                </span>
              )}
            </div>

            {props.action?.items && (
              <DropdownMenu>
                <DropdownMenuTrigger disabled={props.action.disabled}>
                  <MoreVertical size={16} className="shrink-0 opacity-40 hover:opacity-100" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  onCloseAutoFocus={(e) => {
                    if (props.rename?.isRenaming) {
                      e.preventDefault()
                      inputRef.current?.focus()
                      inputRef.current?.select()
                    }
                  }}
                  className="w-56"
                  align="start"
                >
                  {props.action.label && (
                    <>
                      <DropdownMenuLabel>{props.action.label}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {props.action.items.map((action) => {
                    const Icon = action.icon
                    return (
                      <DropdownMenuItem onClick={() => action.action()} key={action.id}>
                        {<Icon className="opacity-40 mr-2" size={14} />} {action.label}
                        <DropdownMenuShortcut>{action.shortcut.label}</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <CollapsibleContent asChild>
          <ul className="pl-2 ml-2 border-l border-dashed">{props.items}</ul>
        </CollapsibleContent>
        {props.drop?.edge && <DropIndicator closestEdge={props.drop.edge} variant="horizontal" />}
        {props.drag?.preview && <DragPreview dragPreviewContainer={props.drag.preview.container}>{props.drag.preview.children}</DragPreview>}
      </li>
    </Collapsible>
  )
}
