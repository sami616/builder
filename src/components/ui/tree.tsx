import { Dispatch, HTMLProps, RefObject, SetStateAction, ComponentType, useEffect, useRef, useContext, createContext, useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { ReactNode } from '@tanstack/react-router'
import clsx from 'clsx'
import { useIsMutating } from '@tanstack/react-query'

const Context = createContext<{
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  renaming: boolean
  setRenaming: Dispatch<SetStateAction<boolean>>
} | null>(null)

export function useFold() {
  const context = useContext(Context)
  if (!context) throw new Error('Must be wrapped in a FoldRoot')
  return context
}

export function Fold(props: {
  open?: boolean
  setOpen?: Dispatch<SetStateAction<boolean>>
  htmlProps?: HTMLProps<HTMLLIElement> & Record<`data-${string}`, any>
  customRef?: RefObject<HTMLLIElement>
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
            'gap-2',
            'p-1',
            'hover:bg-gray-100',
            'has-[&:hover]:bg-[initial]',
            isCanvasMutating && 'pointer-events-none opacity-50',
            props.htmlProps?.className,
          ])}
        >
          {props.children}
        </li>
      </Collapsible>
    </Context.Provider>
  )
}

export function FoldTrigger(props: { hide?: boolean }) {
  const { open } = useFold()
  if (props.hide) return null

  return (
    <CollapsibleTrigger onClick={(e) => e.stopPropagation()} className="cursor-pointer shrink-0 opacity-40 hover:opacity-100" asChild>
      {open ? <ChevronDown size={16} className="shrink-0" /> : <ChevronRight className="shrink-0" size={16} />}
    </CollapsibleTrigger>
  )
}

export function FoldContent(props: { children: JSX.Element[] }) {
  if (props.children.length === 0) return null
  return (
    <CollapsibleContent asChild>
      <ul className="pl-2 ml-2 border-l border-dashed">{props.children}</ul>
    </CollapsibleContent>
  )
}

export function FoldHead(props: {
  htmlProps?: HTMLProps<HTMLDivElement> & Record<`data-${string}`, any>
  children: ReactNode
  customRef?: RefObject<HTMLDivElement>
}) {
  return (
    <div {...props.htmlProps} className={clsx(['flex', 'items-center', 'gap-2', props.htmlProps?.className])} ref={props.customRef}>
      {props.children}
    </div>
  )
}

export function FoldLabel(props: { onRename?: (updatedName: string) => void; label?: string }) {
  const { renaming, setRenaming } = useFold()
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
  return (
    <form
      onDoubleClick={() => {
        if (!props.onRename) return
        setRenaming(true)
      }}
      className="grow"
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const updatedName = formData.get('name') as string
        props.onRename?.(updatedName)
        setRenaming(false)
      }}
    >
      <input
        className="text-sm focus:outline-none w-full bg-gray-200 read-only:cursor-default  read-only:bg-transparent p-1 bg-none rounded"
        readOnly={!renaming}
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

export function FoldIcon(props: { hide?: boolean; icon: ComponentType<{ size?: number | string; className?: string }> }) {
  if (props.hide) return null
  const Icon = props.icon
  return <Icon size={16} className="shrink-0 stroke-emerald-500" />
}
