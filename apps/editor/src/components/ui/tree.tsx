import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '#components/ui/collapsible.tsx'
import { cn } from '#lib/utils.ts'
import { useIsMutating } from '@tanstack/react-query'
import { ReactNode } from '@tanstack/react-router'
import clsx from 'clsx'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { ComponentType, createContext, Dispatch, HTMLProps, RefObject, SetStateAction, useContext, useEffect, useRef, useState } from 'react'

const Context = createContext<{
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  renaming: boolean
  setRenaming: Dispatch<SetStateAction<boolean>>
} | null>(null)

export function useTreeItem() {
  const context = useContext(Context)
  if (!context) throw new Error('Must be wrapped in a TreeItem')
  return context
}

export function Tree(props: { children: ReactNode; className?: string }) {
  return <ul className={props.className}>{props.children}</ul>
}

export function TreeItem(props: {
  open?: boolean
  setOpen?: Dispatch<SetStateAction<boolean>>
  htmlProps?: HTMLProps<HTMLLIElement> & Record<`data-${string}`, any>
  customRef?: RefObject<HTMLLIElement | null>
  disableHover?: boolean
  children?: ReactNode
}) {
  const [renaming, setRenaming] = useState(false)
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
  const [open, setOpen] = useState(props.open ?? false)
  const _setOpen = props.setOpen ?? setOpen
  const _open = props.open ?? open

  return (
    <Context.Provider value={{ open: _open, setOpen: _setOpen, renaming, setRenaming }}>
      <Collapsible asChild open={props.open} onOpenChange={props.setOpen}>
        <li
          {...props.htmlProps}
          ref={props.customRef}
          onClick={(e) => {
            if (e.detail > 1) return
            props.htmlProps?.onClick?.(e)
          }}
          className={clsx([
            'relative',
            'grid',
            'py-1',
            'px-2',
            !props.disableHover && 'hover:bg-gray-100',
            // 'has-[&:hover]:bg-[initial]',
            isCanvasMutating && 'pointer-events-none',
            props.htmlProps?.className,
          ])}
        >
          {props.children}
        </li>
      </Collapsible>
    </Context.Provider>
  )
}

export function TreeItemHead(props: {
  htmlProps?: HTMLProps<HTMLDivElement> & Record<`data-${string}`, any>
  children: ReactNode
  customRef?: RefObject<HTMLDivElement | null>
}) {
  return (
    <div {...props.htmlProps} className={clsx(['flex', 'items-center', 'gap-2', props.htmlProps?.className])} ref={props.customRef}>
      {props.children}
    </div>
  )
}

export function TreeItemIcon(props: { className?: string; hide?: boolean; icon: ComponentType<{ size?: number | string; className?: string }> }) {
  if (props.hide) return null
  const Icon = props.icon
  return <Icon size={16} className={cn('shrink-0 stroke-gray-400', props.className)} />
}

export function TreeItemLabel(props: { onRename?: (updatedName: string) => Promise<number>; label?: string }) {
  const { renaming, setRenaming } = useTreeItem()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function handleClickOutside(e: Event) {
      if (renaming && props.onRename && inputRef?.current && !inputRef.current.contains(e.target as Node)) {
        props.onRename(inputRef.current.value)
        setRenaming(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [renaming, props.onRename])

  useEffect(() => {
    if (renaming) {
      inputRef?.current?.select()
      inputRef?.current?.focus()
    }
  }, [renaming])

  if (!props.label) return null

  if (!renaming) {
    return (
      <div
        className="grow text-sm p-1"
        onDoubleClick={() => {
          if (!props.onRename) return
          setRenaming(true)
        }}
      >
        {props.label}
      </div>
    )
  }

  return (
    <form
      className="grow"
      onSubmit={async (e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const updatedName = formData.get('name') as string
        props.onRename?.(updatedName)
        setRenaming(false)
      }}
    >
      <input
        className="text-sm p-1 focus:outline-none w-full bg-gray-200 bg-none rounded"
        ref={inputRef}
        name="name"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setRenaming(false)
          }
        }}
        defaultValue={props.label}
      />
    </form>
  )
}

export function TreeItemTrigger(props: { hide?: boolean }) {
  const { open } = useTreeItem()
  if (props.hide) return null
  return (
    <CollapsibleTrigger onClick={(e) => e.stopPropagation()} className="cursor-pointer shrink-0 stroke-gray-400 hover:stroke-gray-900">
      {open ? <ChevronDown size={16} className="stroke-inherit" /> : <ChevronRight size={16} className="stroke-inherit" />}
    </CollapsibleTrigger>
  )
}

export function TreeItemContent(props: { children: JSX.Element[] }) {
  if (props.children.length === 0) return null
  return (
    <CollapsibleContent asChild>
      <ul data-collapsible className="pl-2 ml-2 border-l border-dashed">
        {props.children}
      </ul>
    </CollapsibleContent>
  )
}
