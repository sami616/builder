import { useDeferredValue, useRef, useState } from 'react'
import { useBlockHover } from '@/hooks/use-block-hover'
import { DropIndicator } from '@/components/editor/drop-indicator'
import { type Block, type Page } from '@/db'
import { useRouteContext } from '@tanstack/react-router'
import { DragPreview } from '@/components/editor/drag-preview'
import { useDrag, isDragData } from '@/hooks/use-drag'
import { useTemplateApply } from '@/hooks/use-template-apply'
import { useBlockGet } from '@/hooks/use-block-get'
import { useDrop } from '@/hooks/use-drop'
import { useBlockMove } from '@/hooks/use-block-move'
import { Missing } from '@/components/editor/missing'
import clsx from 'clsx'
import { useActive } from '@/hooks/use-active'
import { toast } from 'sonner'
import { validateSlotBlock, validateSlotMax } from './block-layer-item-slot'
import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu'
import { useBlockAdd } from '@/hooks/use-block-add'
import { BlockItemActions } from './block-item-actions'

export function BlockItem(props: { index: number; page: Page; parent: { slot: string; node: Block | Page }; id: Block['id'] }) {
  const { blockGet } = useBlockGet({ id: props.id })
  const deferredBlock = useDeferredValue(blockGet.data)
  const { blockAdd } = useBlockAdd()
  const { blockMove } = useBlockMove()
  const { templateApply } = useTemplateApply()
  const { setActive, isActive, handleActiveClick } = useActive()
  const dropRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const context = useRouteContext({ from: '/pages/$id' })
  const isActiveBlock = isActive({ store: 'blocks', item: { ...deferredBlock, index: props.index, parent: props.parent } })
  const [actionsOpen, setActionsOpen] = useState(false)
  const { setHover, removeHover } = useBlockHover(deferredBlock.id, dropRef)

  const { closestEdge } = useDrop({
    dropRef: dropRef,
    data: { index: props.index, parent: props.parent, node: deferredBlock },
    onDrop: ({ source, target }) => {
      try {
        validateSlotMax({ source, target: target.data })
        validateSlotBlock({ source, target: target.data })
      } catch (e) {
        if (e instanceof Error) toast.error(e.message, { richColors: true })
        return
      }

      if (isDragData['component'](source.data)) {
        blockAdd({ source: source.data, target: target.data })
      }
      if (isDragData['template'](source.data)) {
        templateApply({ source: source.data, target: target.data })
      }
      if (isDragData['block'](source.data)) {
        blockMove({ source: source.data, target: target.data })
      }
    },
  })

  const { isDraggingSource, dragPreviewContainer } = useDrag({
    dragRef,
    data: { id: 'block', index: props.index, parent: props.parent, node: deferredBlock },
  })

  const deferredComponentBlocks = useDeferredValue(
    Object.keys(deferredBlock.slots).reduce<{
      [key: string]: JSX.Element[] | JSX.Element
    }>((acc, slot) => {
      acc[slot] = deferredBlock.slots[slot].map((id, index) => {
        return <BlockItem index={index} parent={{ slot, node: deferredBlock }} page={props.page} key={id} id={id} />
      })

      return acc
    }, {}),
  )

  const Component = context.config[deferredBlock.type]?.component ?? (() => <Missing node={{ type: 'component', name: deferredBlock.type }} />)

  return (
    <>
      <ContextMenu
        onOpenChange={(bool) => {
          setActionsOpen(bool)
          if (bool) {
            setActive({ store: 'blocks', items: [{ ...deferredBlock, index: props.index, parent: props.parent }] })
          } else {
            setActive({ store: 'none', items: [] })
          }
        }}
      >
        <ContextMenuTrigger asChild>
          <div
            data-component="BlockItem"
            className={clsx([
              'group',
              'relative',
              'outline',
              'outline-2',
              '-outline-offset-2',
              'outline-none',
              isDraggingSource && 'opacity-50',
              isActiveBlock && 'outline-rose-500 hover:outline-rose-600',
            ])}
            data-drop-id={`block-${deferredBlock.id}`}
            onClick={(e) => {
              e.stopPropagation()
              handleActiveClick({ metaKey: e.metaKey, store: 'blocks', item: { ...deferredBlock, index: props.index, parent: props.parent } })
            }}
            onMouseOver={(e) => {
              e.stopPropagation()
              if (actionsOpen) return
              setHover()
            }}
            onMouseOut={(e) => {
              e.stopPropagation()
              if (actionsOpen) return
              removeHover()
            }}
            ref={dropRef}
          >
            <div ref={dragRef}>
              <Component {...deferredBlock.props} {...deferredComponentBlocks} />
              <DropIndicator closestEdge={closestEdge} variant="horizontal" />
              <DragPreview dragPreviewContainer={dragPreviewContainer}>{deferredBlock.name}</DragPreview>
            </div>
          </div>
        </ContextMenuTrigger>
        <BlockItemActions block={deferredBlock} index={props.index} parent={props.parent} />
      </ContextMenu>
    </>
  )
}
