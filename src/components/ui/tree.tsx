import { Dispatch, HTMLProps, RefObject, SetStateAction, ComponentType, useEffect, useRef } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, MoreVertical } from 'lucide-react'
import { DropIndicator } from '@/components/editor/drop-indicator'
import { Edge } from '@/hooks/use-drop'
import { ReactNode } from '@tanstack/react-router'
import { DragPreview } from '@/components/editor/drag-preview'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Actions } from '@/hooks/use-keyboard'

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
    items: Actions
    label: string
  }
  disabled?: boolean
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

  const ItemIcon = props.item.icon ?? null
  const itemIcon = ItemIcon ? <ItemIcon size={14} className="shrink-0 stroke-emerald-500" /> : null

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
          'hover:bg-gray-100',
          'has-[&:hover]:bg-[initial]',
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
            onClick={(e) => {
              if (!props.disabled) {
                props.setActive?.(e)
              }
            }}
            ref={props.drag?.ref}
            className={`${props.drag ? 'cursor-move' : 'cursor-default'} ${props.disabled ? 'cursor-not-allowed' : 'cursor-default'} flex grow gap-2 items-center`}
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
                  if (props.disabled) return
                  props.rename?.setIsRenaming(true)
                }}
              >
                {props.item.label}
              </span>
            )}
            {props.action?.items && (
              <DropdownMenu>
                <DropdownMenuTrigger className="shrink-0 opacity-40 enabled:hover:opacity-100" disabled={props.disabled}>
                  <MoreVertical size={16} />
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
                    if (!action.ui) return null
                    const ActionIcon = action.ui?.icon
                    const actionIcon = ActionIcon ? <ActionIcon size={14} className="opacity-40 mr-2" /> : null
                    return (
                      <DropdownMenuItem
                        disabled={action.disabled}
                        onClick={(e) => {
                          e.stopPropagation()
                          action.action()
                        }}
                        key={action.id}
                      >
                        {actionIcon} {action.ui?.label}
                        {action.shortcut && <DropdownMenuShortcut>{action.shortcut.label}</DropdownMenuShortcut>}
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
        className={[
          'select-none',
          'grid',
          'gap-2',
          'p-2',
          'text-sm',
          'hover:bg-gray-100',
          'has-[&:hover]:bg-[initial]',
          props.isHovered ? 'bg-gray-100' : '',
          props.drag?.isDragging ? 'opacity-50' : 'opacity-100',
          props.drop?.isDraggingOver ? 'bg-gray-100' : '',
          props.isActive && 'ring-inset ring-2 ring-emerald-500',
          props.li?.className,
        ].join(' ')}
        ref={props.drop?.ref}
      >
        <div className="w-full flex gap-2 items-center">
          <CollapsibleTrigger className="cursor-pointer shrink-0 opacity-40 hover:opacity-100" asChild>
            {props.open ? <ChevronDown size={16} className="shrink-0" /> : <ChevronRight className="shrink-0" size={16} />}
          </CollapsibleTrigger>
          <div className="flex gap-2 grow">
            <div
              onClick={(e) => {
                if (!props.disabled) {
                  props.setActive?.(e)
                }
              }}
              ref={props.drag?.ref}
              className={`${props.drag ? 'cursor-move' : 'cursor-default'} ${props.disabled ? 'cursor-not-allowed' : 'cursor-default'} flex grow gap-2 items-center`}
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
                    if (props.disabled) return
                    props.rename?.setIsRenaming(true)
                  }}
                >
                  {props.item.label}
                </span>
              )}
            </div>

            {props.action?.items && (
              <DropdownMenu>
                <DropdownMenuTrigger className="shrink-0 opacity-40 enabled:hover:opacity-100" disabled={props.disabled}>
                  <MoreVertical size={16} />
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
                    if (!action.ui) return null
                    const ActionIcon = action.ui?.icon
                    const actionIcon = ActionIcon ? <ActionIcon size={14} className="opacity-40 mr-2" /> : null
                    return (
                      <DropdownMenuItem disabled={action.disabled} onClick={() => action.action()} key={action.id}>
                        {actionIcon} {action.ui?.label}
                        {action.shortcut && <DropdownMenuShortcut>{action.shortcut.label}</DropdownMenuShortcut>}
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

export function _Tree(props: { children: ReactNode }) {
  return <ul className="pl-2 ml-2 border-l border-dashed">{props.children}</ul>
}

export function TreeItem(props: {
  item: {
    label?: string
    icon?: ComponentType<{ className?: string; size?: number | string }>
  }
  drop?: { isDraggingOver?: boolean; ref: RefObject<HTMLLIElement>; edge?: Edge }
  drag?: { isDragging?: boolean; ref: RefObject<HTMLDivElement>; preview: { container: HTMLElement | null; children: ReactNode } }
  open?: boolean
  rename?: { isRenaming: boolean; setIsRenaming: Dispatch<SetStateAction<boolean>>; onRename: (updatedName: string) => void }
  setOpen?: Dispatch<SetStateAction<boolean>>
  li?: HTMLProps<HTMLLIElement> & Record<`data-${string}`, any>
  isHovered?: boolean
  onCloseAutoFocus?: (e: Event) => void
  action?: {
    items: Actions
    label: string
  }
  children?: ComponentType<typeof TreeItem>
  disabled?: boolean
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

  const ItemIcon = props.item.icon ?? null
  const itemIcon = ItemIcon ? <ItemIcon size={14} className="shrink-0 stroke-emerald-500" /> : null
  return (
    <Collapsible asChild open={props.open} onOpenChange={props.setOpen}>
      <li
        {...props.li}
        className={[
          'select-none',
          'grid',
          'gap-2',
          'p-2',
          'text-sm',
          'hover:bg-gray-100',
          'has-[&:hover]:bg-[initial]',
          props.isHovered ? 'bg-gray-100' : '',
          props.drag?.isDragging ? 'opacity-50' : 'opacity-100',
          props.drop?.isDraggingOver ? 'bg-gray-100' : '',
          props.isActive && 'ring-inset ring-2 ring-emerald-500',
          props.li?.className,
        ].join(' ')}
        ref={props.drop?.ref}
      >
        <div className="w-full flex gap-2 items-center">
          <CollapsibleTrigger className="cursor-pointer shrink-0 opacity-40 hover:opacity-100" asChild>
            {props.open ? <ChevronDown size={16} className="shrink-0" /> : <ChevronRight className="shrink-0" size={16} />}
          </CollapsibleTrigger>
          <div className="flex gap-2 grow">
            <div
              onClick={(e) => {
                if (!props.disabled) {
                  props.setActive?.(e)
                }
              }}
              ref={props.drag?.ref}
              className={`${props.drag ? 'cursor-move' : 'cursor-default'} ${props.disabled ? 'cursor-not-allowed' : 'cursor-default'} flex grow gap-2 items-center`}
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
                    if (props.disabled) return
                    props.rename?.setIsRenaming(true)
                  }}
                >
                  {props.item.label}
                </span>
              )}
            </div>

            {props.action?.items && (
              <DropdownMenu>
                <DropdownMenuTrigger className="shrink-0 opacity-40 enabled:hover:opacity-100" disabled={props.disabled}>
                  <MoreVertical size={16} />
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
                    if (!action.ui) return null
                    const ActionIcon = action.ui?.icon
                    const actionIcon = ActionIcon ? <ActionIcon size={14} className="opacity-40 mr-2" /> : null
                    return (
                      <DropdownMenuItem disabled={action.disabled} onClick={() => action.action()} key={action.id}>
                        {actionIcon} {action.ui?.label}
                        {action.shortcut && <DropdownMenuShortcut>{action.shortcut.label}</DropdownMenuShortcut>}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <CollapsibleContent asChild>
          <ul className="pl-2 ml-2 border-l border-dashed">{props.children}</ul>
        </CollapsibleContent>
        {props.drop?.edge && <DropIndicator closestEdge={props.drop.edge} variant="horizontal" />}
        {props.drag?.preview && <DragPreview dragPreviewContainer={props.drag.preview.container}>{props.drag.preview.children}</DragPreview>}
      </li>
    </Collapsible>
  )
}

/*
<Tree>
  <TreeItem icon={Icon} label={'Item'}/>
</Tree> 



<Tree>
  <TreeItem icon={Icon} label={'Item'}>
<TreeItem icon={Icon} label={'Item'}>
  </TreeItem>
</Tree> 
*/
