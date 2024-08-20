import { Experience } from '../db'
import { useEffect, useRef, useState } from 'react'
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { Blocks, isBlock } from '../utils'
import './BlockItem.css'

export function BlockItem(props: {
  experience: Experience
  type: Experience['blocks'][number]['type']
  isCanvasUpdatePending: boolean
}) {
  const ref = useRef<HTMLLIElement>(null)
  const [isDragging, setDragging] = useState<boolean>(false)

  useEffect(() => {
    if (!ref.current) return
    return draggable({
      element: ref.current,
      getInitialData: (): BlockItemSource => ({
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
    <li data-component="BlockItem" ref={ref} style={style} key={props.type}>
      {props.type}
    </li>
  )
}

type BlockItemSource = {
  type: Blocks
  id: 'blockItem'
}

export function isBlockItemSource(
  args: Record<string, unknown>,
): args is BlockItemSource {
  return isBlock(args.type) && args.id === 'blockItem'
}
