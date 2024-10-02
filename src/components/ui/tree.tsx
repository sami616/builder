import { Dispatch, HTMLProps, RefObject, SetStateAction } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { DropIndicator } from '../editor/DropIndicator'
import { DragPreview } from '../editor/DragPreview'
import { Edge } from '@/hooks/useDrop'
import { ReactNode } from '@tanstack/react-router'

export function Tree(props: {
  drop?: { ref: RefObject<HTMLLIElement>; edge: Edge }
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  li: HTMLProps<HTMLLIElement>
  item: ReactNode
  collapsibleItems: JSX.Element[]
  isHovered: boolean
  isDragging: boolean
  active: boolean
}) {
  return (
    <Collapsible asChild open={props.open} onOpenChange={props.setOpen}>
      <li
        {...props.li}
        ref={props.drop?.ref}
        // data-component="BlockLayerItem"
        // data-drop-id={`block-${blockGet.data.id}`}
        className={[
          'select-none',
          'grid',
          'gap-2',
          'p-2',
          'text-sm',
          props.isHovered && 'bg-gray-100',
          props.isDragging ? 'opacity-50' : 'opacity-100',
          props.active && 'ring-inset ring-2 ring-emerald-500',
        ].join(' ')}
      >
        <div className="w-full flex gap-2 items-center">
          <CollapsibleTrigger className="cursor-pointer shrink-0 opacity-40 hover:opacity-100" asChild>
            {props.open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </CollapsibleTrigger>
          {props.item}
        </div>
        <CollapsibleContent asChild>
          <ul className="pl-2 ml-2 border-l border-dashed">{props.collapsibleItems}</ul>
        </CollapsibleContent>
        {/* stuff  */}
        {props.drop && <DropIndicator closestEdge={props.drop.edge} variant="horizontal" />}
        {/* <DragPreview dragPreviewContainer={dragPreviewContainer}>{blockGet.data.name}</DragPreview> */}
      </li>
    </Collapsible>
  )
}
