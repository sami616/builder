import { Dispatch, HTMLProps, RefObject, SetStateAction, ComponentType, useEffect, useRef, ComponentProps } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { DropIndicator } from '@/components/editor/drop-indicator'
import { Edge } from '@/hooks/use-drop'
import { ReactNode } from '@tanstack/react-router'
import { DragPreview } from '@/components/editor/drag-preview'
import { Actions } from '../editor/actions'
import { useIsMutating } from '@tanstack/react-query'
import clsx from 'clsx'

export function Tree(props: { children: ReactNode }) {
  return <ul>{props.children}</ul>
}

export function TreeItem(props: {
  label?: string
  icon?: ComponentType<{ className?: string; size?: number | string }>
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
  setActive?: (e: React.MouseEvent<HTMLDivElement>) => any
  actions?: ComponentProps<typeof Actions>
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))

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

  const ItemIcon = props.icon ?? null
  const itemIcon = ItemIcon ? <ItemIcon size={14} className="shrink-0 stroke-emerald-500" /> : null
  return (
    <Collapsible asChild open={props.collapsible?.open} onOpenChange={props.collapsible?.setOpen}>
      <li
        {...props.htmlProps}
        className={clsx([
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
          props.htmlProps?.className,
        ])}
        ref={props.drop?.ref}
      >
        <div className="w-full flex gap-2 items-center">
          {props.collapsible && props.children && (
            <CollapsibleTrigger className="cursor-pointer shrink-0 opacity-40 hover:opacity-100" asChild>
              {props.collapsible?.open ? <ChevronDown size={16} className="shrink-0" /> : <ChevronRight className="shrink-0" size={16} />}
            </CollapsibleTrigger>
          )}
          <div className="flex gap-2 grow">
            <div
              onClick={(e) => {
                if (isCanvasMutating) return
                props.setActive?.(e)
              }}
              ref={props.drag?.ref}
              className={`${props.drag ? 'cursor-move' : 'cursor-default'} ${isCanvasMutating ? 'cursor-not-allowed' : 'cursor-default'} flex grow gap-2 items-center`}
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
                    defaultValue={props.label}
                  />
                </form>
              ) : (
                <span
                  className="w-full p-1"
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    if (isCanvasMutating) return
                    props.rename?.setIsRenaming(true)
                  }}
                >
                  {props.label}
                </span>
              )}
            </div>

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
