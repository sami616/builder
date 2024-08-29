import { Experience } from '../db'
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'
import { config } from '../main'
import { useEffect, useRef, useState } from 'react'
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { type Block } from '../db'
import './ComponentItem.css'
import { DragPreview } from './DragPreview'

export function ComponentItem(props: {
  experience: Experience
  type: Block['type']
  isCanvasUpdatePending: boolean
}) {
  const ref = useRef<HTMLLIElement>(null)
  const [isDragging, setDragging] = useState<boolean>(false)

  const [dragPreviewContainer, setDragPreviewContainer] =
    useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    return draggable({
      element: ref.current,
      getInitialData: (): ComponentItemSource => ({
        type: props.type,
        id: 'blockItem',
      }),
      onGenerateDragPreview: ({ nativeSetDragImage }) => {
        setCustomNativeDragPreview({
          nativeSetDragImage,
          render({ container }) {
            setDragPreviewContainer(container)
          },
        })
      },
      onDragStart: () => setDragging(true),
      onDrop: () => setDragging(false),
      canDrag: () => !props.isCanvasUpdatePending,
    })
  }, [props.type, props.isCanvasUpdatePending])

  const style = {
    opacity: isDragging || props.isCanvasUpdatePending ? 0.5 : 1,
  }

  return (
    <>
      <li
        data-component="ComponentItem"
        ref={ref}
        style={style}
        key={props.type}
      >
        {props.type}
      </li>
      <DragPreview dragPreviewContainer={dragPreviewContainer}>
        Add {props.type} ➕
      </DragPreview>
    </>
  )
}

export type ComponentItemSource = {
  type: Block['type']
  id: 'blockItem'
}

export function isComponentItemSource(
  args: Record<string, unknown>,
): args is ComponentItemSource {
  if (typeof args.type !== 'string') return false
  return Object.keys(config).includes(args.type)
}
