import { Dispatch, HTMLProps, MouseEvent, RefObject, SetStateAction, ComponentType, useEffect, useRef, ComponentProps } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { DropIndicator } from '@/components/editor/drop-indicator'
import { Edge } from '@/hooks/use-drop'
import { ReactNode } from '@tanstack/react-router'
import { DragPreview } from '@/components/editor/drag-preview'
import { Actions } from '../editor/actions'
import { useIsMutating } from '@tanstack/react-query'
import clsx from 'clsx'

export function TreeItem(props: {
  label?: string
  Icon?: ComponentType<{ className?: string; size?: number | string }>
  htmlProps?: HTMLProps<HTMLLIElement> & Record<`data-${string}`, any>
  isHovered?: boolean
  children?: ReactNode
  drop?: { isDraggingOver?: boolean; ref: RefObject<HTMLLIElement>; edge?: Edge }
  drag?: { isDragging?: boolean; ref: RefObject<HTMLDivElement>; preview: { container: HTMLElement | null; children: ReactNode } }
  rename?: { isRenaming: boolean; setIsRenaming: Dispatch<SetStateAction<boolean>>; onRename: (updatedName: string) => void }
  collapsible?: {
    open?: boolean
    setOpen?: Dispatch<SetStateAction<boolean>>
  }
  isActive?: boolean
  setActive?: (e: MouseEvent<HTMLLIElement>) => any
  actions?: ComponentProps<typeof Actions>
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))

  useEffect(() => {
    async function handleClickOutside(e: Event) {
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

  const { Icon } = props
  const ItemIcon = Icon ? <Icon size={14} className="shrink-0 stroke-emerald-500" /> : null

  return (
    <Collapsible asChild open={props.collapsible?.open} onOpenChange={props.collapsible?.setOpen}>
      <li
        {...props.htmlProps}
        ref={props.drop?.ref}
        className={clsx(
          'p-2',
          'text-sm',
          'hover:bg-gray-100',
          'has-[&:hover]:bg-[initial]',
          props.isHovered && 'bg-gray-100',
          props.drag?.isDragging ? 'opacity-50' : 'opacity-100',
          props.drop?.isDraggingOver && 'bg-gray-100',
          props.isActive && 'ring-inset ring-2 ring-emerald-500',
          props.htmlProps?.className,
        )}
        onClick={(e) => {
          // dont fire if its a double click
          if (e.detail > 1) return
          if (isCanvasMutating) return
          props.setActive?.(e)
        }}
        onDoubleClick={() => {
          if (isCanvasMutating) return
          props.rename?.setIsRenaming(true)
        }}
      >
        <div className={clsx(['flex', 'items-center', 'gap-2'])} ref={props.drag?.ref}>
          {props.collapsible && props.children && (
            <CollapsibleTrigger onClick={(e) => e.stopPropagation()} className="cursor-pointer shrink-0 opacity-40 hover:opacity-100" asChild>
              {props.collapsible?.open ? <ChevronDown size={16} className="shrink-0" /> : <ChevronRight className="shrink-0" size={16} />}
            </CollapsibleTrigger>
          )}
          {ItemIcon}
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
              className="focus:outline-none w-full bg-gray-200 read-only:bg-transparent p-1 bg-none rounded"
              readOnly={!props.rename?.isRenaming}
              ref={inputRef}
              name="name"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  props.rename?.setIsRenaming(false)
                }
              }}
              defaultValue={props.label}
            />
          </form>
          {props.actions && (
            <Actions
              {...props.actions}
              onCloseAutoFocus={(e) => {
                if (props.rename?.isRenaming) {
                  e.preventDefault()
                  selectInput()
                }
              }}
            />
          )}
        </div>
        {props.children && (
          <CollapsibleContent asChild>
            <ul className="pl-2 ml-2 border-l border-dashed">{props.children}</ul>
          </CollapsibleContent>
        )}
        {props.drop?.edge && <DropIndicator closestEdge={props.drop.edge} variant="horizontal" />}
        {props.drag?.preview && <DragPreview dragPreviewContainer={props.drag.preview.container}>{props.drag.preview.children}</DragPreview>}
      </li>
    </Collapsible>
  )
}

export function _TreeItem(props: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  htmlProps: HTMLProps<HTMLLIElement> & Record<`data-${string}`, any>
  drop?: { isDraggingOver?: boolean; ref: RefObject<HTMLLIElement>; edge?: Edge }
  drag?: { isDragging?: boolean; ref: RefObject<HTMLDivElement>; preview: { container: HTMLElement | null; children: ReactNode } }
  children?: ReactNode
}) {
  return (
    <Collapsible asChild open={props.open} onOpenChange={props.setOpen}>
      <li
        {...props.htmlProps}
        ref={props.drop?.ref}
        onClick={(e) => {
          // dont fire if its a double click
          if (e.detail > 1) return
          props.htmlProps.onClick?.(e)
        }}
        onDoubleClick={(e) => {
          props.htmlProps.onDoubleClick?.(e)
        }}
        className={clsx([
          'select-none',
          'grid',
          'gap-2',
          'p-2',
          'text-sm',
          'hover:bg-gray-100',
          'has-[&:hover]:bg-[initial]',
          props.drag?.isDragging ? 'opacity-50' : 'opacity-100',
          props.drop?.isDraggingOver ? 'bg-gray-100' : '',
          props.htmlProps?.className,
        ])}
      >
        <div className={clsx(['flex', 'items-center', 'gap-2'])} ref={props.drag?.ref}>
          {props.children}
        </div>
        {props.drop?.edge && <DropIndicator closestEdge={props.drop.edge} variant="horizontal" />}
        {props.drag?.preview && <DragPreview dragPreviewContainer={props.drag.preview.container}>{props.drag.preview.children}</DragPreview>}
      </li>
    </Collapsible>
  )
}

export function _TreeItemTrigger(props: { open: boolean; setOpen: Dispatch<SetStateAction<boolean>> }) {
  return (
    <CollapsibleTrigger onClick={(e) => e.stopPropagation()} className="cursor-pointer shrink-0 opacity-40 hover:opacity-100" asChild>
      {props.open ? <ChevronDown size={16} className="shrink-0" /> : <ChevronRight className="shrink-0" size={16} />}
    </CollapsibleTrigger>
  )
}

export function _TreeItemContent(props: { children: ReactNode }) {
  if (!props.children) return null
  return (
    <CollapsibleContent asChild>
      <ul className="pl-2 ml-2 border-l border-dashed">{props.children}</ul>
    </CollapsibleContent>
  )
}

export function _TreeItemLabel(props: {
  isRenaming?: boolean
  setIsRenaming?: Dispatch<SetStateAction<boolean>>
  onRename?: (updatedName: string) => void
  inputRef?: RefObject<HTMLInputElement>
  label: string
}) {
  useEffect(() => {
    async function handleClickOutside(e: Event) {
      if (props?.isRenaming && props.inputRef?.current && !props.inputRef.current.contains(e.target as Node)) {
        props?.onRename?.(props.inputRef.current.value)
        props?.setIsRenaming?.(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [props.isRenaming])

  function selectInput() {
    props.inputRef?.current?.select()
    props.inputRef?.current?.focus()
  }
  useEffect(() => {
    if (props.isRenaming) {
      selectInput()
    }
  }, [props.isRenaming])

  return (
    <form
      className="grow"
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const updatedName = formData.get('name') as string
        props.onRename?.(updatedName)
        props.setIsRenaming?.(false)
      }}
    >
      <input
        className="focus:outline-none w-full bg-gray-200 read-only:bg-transparent p-1 bg-none rounded"
        readOnly={!props.isRenaming}
        ref={props.inputRef}
        name="name"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            props.setIsRenaming?.(false)
          }
        }}
        defaultValue={props.label}
      />
    </form>
  )
}
