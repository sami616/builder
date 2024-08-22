import { Experience } from '../db'
import { useEffect, useRef, useState } from 'react'
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { isBlock } from '../utils'
import { type Block } from '../db'
import './ComponentItem.css'

export function ComponentItem(props: {
  experience: Experience
  type: Block['type']
  isCanvasUpdatePending: boolean
}) {
  const ref = useRef<HTMLLIElement>(null)
  const [isDragging, setDragging] = useState<boolean>(false)

  useEffect(() => {
    if (!ref.current) return
    return draggable({
      element: ref.current,
      getInitialData: (): ComponentItemSource => ({
        type: props.type,
        id: 'blockItem',
      }),
      onDragStart: () => setDragging(true),
      onDrop: () => setDragging(false),
      canDrag: () => !props.isCanvasUpdatePending,
    })
  }, [props.type, props.isCanvasUpdatePending])

  const style = {
    opacity: isDragging || props.isCanvasUpdatePending ? 0.5 : 1,
  }

  return (
    <li data-component="ComponentItem" ref={ref} style={style} key={props.type}>
      {props.type}
    </li>
  )
}

type ComponentItemSource = {
  type: Block['type']
  id: 'blockItem'
}

export function isComponentItemSource(
  args: Record<string, unknown>,
): args is ComponentItemSource {
  return isBlock(args.type) && args.id === 'blockItem'
}
