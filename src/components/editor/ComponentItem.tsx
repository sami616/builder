import { type Page, type Block } from '@/db'
import { Config } from '@/main'
import { useRef, useState } from 'react'
import { DragPreview } from '@/components/editor/DragPreview'
import { NestedStructure } from '@/components/editor/ComponentPanel'
import { useDrag } from '@/hooks/useDrag'
import { ChevronRight, ChevronDown, Component } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'

export function ComponentItem(props: { page: Page; type: Block['type']; value: NestedStructure | Config[keyof Config] }) {
  const dragRef = useRef<HTMLDivElement>(null)
  const { isDraggingSource, dragPreviewContainer } = useDrag({
    dragRef,
    data: {
      id: 'componentItem',
      type: props.type,
    },
  })

  const [open, setOpen] = useState(false)
  const isLeaf = typeof props.value === 'object' && 'component' in props.value

  if (!isLeaf) {
    return (
      <Collapsible asChild open={open} onOpenChange={setOpen}>
        <li className={`select-none text-sm  p-2 grid gap-2`}>
          <div className="flex gap-2 items-center">
            <CollapsibleTrigger asChild className="cursor-pointer opacity-40 hover:opacity-100">
              {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </CollapsibleTrigger>
            {props.type}
          </div>
          <CollapsibleContent asChild>
            <ul className="pl-2 ml-2 border-l border-dashed">
              {Object.entries(props.value as NestedStructure).map(([key, value]) => (
                <ComponentItem value={value} key={key} type={key as Block['type']} page={props.page} />
              ))}
            </ul>
          </CollapsibleContent>
        </li>
      </Collapsible>
    )
  }

  return (
    <li
      className={[
        'select-none',
        'grid',
        'gap-2',
        'p-2',
        'text-sm',
        'hover:bg-muted',
        isDraggingSource ? 'opacity-50' : 'opacity-100',
      ].join(' ')}
      data-component="ComponentItem"
      key={props.type}
    >
      <div className="flex gap-2 grow">
        <div ref={dragRef} className="cursor-move flex gap-2 grow items-center">
          <Component size={14} className="shrink-0 stroke-emerald-500" />
          {props.type}
        </div>
      </div>
      <DragPreview dragPreviewContainer={dragPreviewContainer}>{props.type}</DragPreview>
    </li>
  )
}
