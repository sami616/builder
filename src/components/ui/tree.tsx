import { Dispatch, HTMLProps, RefObject, MouseEvent, SetStateAction } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { DropIndicator } from '../editor/DropIndicator'
import { Edge } from '@/hooks/useDrop'
import { ReactNode } from '@tanstack/react-router'
import { DragPreview } from '../editor/DragPreview'

export function Tree(props: {
  item: ReactNode
  items?: JSX.Element[]
  drop?: { isDraggingOver?: boolean; ref: RefObject<HTMLLIElement>; edge?: Edge }
  drag?: { isDragging?: boolean; ref: RefObject<HTMLDivElement>; preview: { container: HTMLElement | null; children: ReactNode } }
  open?: boolean
  setOpen?: Dispatch<SetStateAction<boolean>>
  li?: HTMLProps<HTMLLIElement> & Record<`data-${string}`, any>
  isHovered?: boolean
  action?: ReactNode
  isActive?: boolean
  setActive?: (e: MouseEvent<HTMLDivElement>) => any
}) {
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
            {props.item}
          </div>
          {props.action}
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
              {props.item}
            </div>
            {props.action}
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
