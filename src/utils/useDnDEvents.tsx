import { useEffect } from 'react'
import { type Drop, isDrop } from '../utils/useDrop'

import { type ComponentItemSource, isComponentItemSource } from '../editor-components/ComponentItem'
import { isDragDrop, type DragDrop } from '../utils/useDragDrop'
import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { db } from '../db'
import { duplicateTree, getTree } from '../api'

export function useDnDEvents() {
  const context = useRouteContext({ from: '/experiences/$id' })

  const handleApplyTemplate = useMutation({
    mutationFn: async (args: { source: DragDrop['Template']['Source']; target: DragDrop['Block']['Target'] | Drop['Block']['Target'] }) => {
      const clonedParentNode = structuredClone(args.target.parent.node)
      const tree = await getTree({ root: { id: args.source.node.slots.root[0], store: 'blocks' } })
      const rootEntry = await duplicateTree({ tree })

      const addSlot = args.target.parent.slot

      if ('index' in args.target) {
        let addIndex = args.target.index
        let { edge } = args.target
        if (edge === 'bottom') addIndex += 1
        clonedParentNode.slots[addSlot].splice(addIndex, 0, rootEntry.id)
      } else {
        clonedParentNode.slots[addSlot].push(rootEntry.id)
      }

      return context.update({ entry: clonedParentNode })
    },

    onSuccess: (data, vars) => {
      context.queryClient.invalidateQueries({ queryKey: [vars.target.parent.node.store, data] })
    },
  })

  const handleReorderTemplates = useMutation({
    mutationFn: async (args: { source: DragDrop['Template']['Source']; target: DragDrop['Template']['Target'] }) => {
      const tx = db.transaction('templates', 'readwrite')
      const clonedSource = structuredClone(args.source.node)
      const { edge } = args.target
      let addIndex = args.target.index
      let removeIndex = args.source.index
      let range: IDBKeyRange
      let direction: IDBCursorDirection
      const index = tx.store.index('order')
      let op: '+' | '-'

      function shiftCursor(val: number, op: '+' | '-') {
        return op === '+' ? val + 1 : val - 1
      }

      if (removeIndex < addIndex) {
        if (edge === 'top') addIndex -= 1
        range = IDBKeyRange.bound(removeIndex + 1, addIndex)
        direction = 'next'
        op = '-'
      } else {
        if (edge === 'bottom') addIndex += 1
        range = IDBKeyRange.bound(addIndex, removeIndex - 1)
        direction = 'prev'
        op = '+'
      }

      let cursor = await index.openCursor(range, direction)
      while (cursor) {
        const item = cursor.value
        item.order = shiftCursor(item.order, op)
        await cursor.update(item)
        cursor = await cursor.continue()
      }

      clonedSource.order = addIndex
      return tx.store.put(clonedSource)
    },
    onSuccess: () => {
      context.queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })

  const handleAddTemplate = useMutation({
    mutationFn: async (args: { source: DragDrop['Block']['Source']; target: Drop['Template']['Target'] | DragDrop['Template']['Target'] }) => {
      const tree = await context.getTree({ root: { store: 'blocks', id: args.source.node.id } })
      const rootEntry = await context.duplicateTree({ tree })
      const tx = db.transaction('templates', 'readwrite')

      const date = new Date()
      const template = {
        name: args.source.node.name,
        createdAt: date,
        updatedAt: date,
        slots: { root: [rootEntry.id] },
      }

      if (isDragDrop.template.target(args.target)) {
        let addIndex = args.target.index
        let { edge } = args.target
        if (edge === 'bottom') addIndex += 1

        const index = tx.store.index('order')
        const range = IDBKeyRange.lowerBound(addIndex)
        let cursor = await index.openCursor(range, 'prev')

        while (cursor) {
          const item = cursor.value
          item.order += 1
          await cursor.update(item)
          cursor = await cursor.continue()
        }
        return context.add({ entry: { ...template, store: 'templates', order: addIndex } })
      } else {
        return context.add({ entry: { ...template, store: 'templates', order: 0 } })
      }
    },
    onSuccess: () => {
      context.queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })

  const handleAddBlock = useMutation({
    mutationFn: async (args: { source: ComponentItemSource; target: DragDrop['Block']['Target'] | Drop['Block']['Target'] }) => {
      const clonedParentNode = structuredClone(args.target.parent.node)
      const configItem = context.config[args.source.type]
      const propKeys = Object.keys(configItem.props)
      const slotKeys = Object.keys(configItem.slots)
      const slot = args.target.parent.slot

      const defaultProps = propKeys.reduce((props, propKey) => {
        return { ...props, [propKey]: configItem.props[propKey].default }
      }, {})

      const defaultSlots = slotKeys.reduce((blocks, slot) => {
        return { ...blocks, [slot]: configItem.slots[slot].default }
      }, {})

      const date = new Date()
      const blockId = await context.add({
        entry: {
          store: 'blocks',
          type: args.source.type,
          name: configItem.name,
          props: defaultProps,
          slots: defaultSlots,
          createdAt: date,
          updatedAt: date,
        },
      })

      // Add new item
      if (isDragDrop.block.target(args.target)) {
        let addIndex = args.target.index
        let { edge } = args.target
        if (edge === 'bottom') addIndex += 1
        clonedParentNode.slots[slot].splice(addIndex, 0, blockId)
      } else {
        clonedParentNode.slots[slot].push(blockId)
      }

      return context.update({ entry: clonedParentNode })
    },
    onSuccess: (data, vars) => {
      context.queryClient.invalidateQueries({ queryKey: [vars.target.parent.node.store, data] })
    },
  })

  const handleReorderBlock = useMutation({
    mutationFn: async (args: { source: DragDrop['Block']['Source']; target: DragDrop['Block']['Target'] | Drop['Block']['Target'] }) => {
      const clonedParentNode = structuredClone(args.target.parent.node)
      const addSlot = args.target.parent.slot
      const removeSlot = args.source.parent.slot
      let removeIndex = args.source.index

      if ('index' in args.target) {
        let { edge } = args.target
        let addIndex = args.target.index
        if (edge === 'bottom') addIndex += 1
        // adjust removeIndex by 1 when reordering in same slot seeing as we add first, then remove
        if (removeSlot === addSlot && removeIndex >= addIndex) removeIndex += 1
        clonedParentNode.slots[addSlot].splice(addIndex, 0, args.source.node.id)
      } else {
        clonedParentNode.slots[addSlot].push(args.source.node.id)
      }

      clonedParentNode.slots[removeSlot].splice(removeIndex, 1)
      return context.update({ entry: clonedParentNode })
    },
    onSuccess: (data, vars) => {
      context.queryClient.invalidateQueries({ queryKey: [vars.target.parent.node.store, data] })
    },
  })

  const handleReparentBlock = useMutation({
    mutationFn: async (args: { source: DragDrop['Block']['Source']; target: DragDrop['Block']['Target'] | Drop['Block']['Target'] }) => {
      const clonedSourceParentNode = structuredClone(args.source.parent.node)
      const clonedTargetParentNode = structuredClone(args.target.parent.node)
      const addSlot = args.target.parent.slot
      const removeSlot = args.source.parent.slot
      let removeIndex = args.source.index

      if ('index' in args.target) {
        let addIndex = args.target.index
        let { edge } = args.target
        if (edge === 'bottom') addIndex += 1
        clonedTargetParentNode.slots[addSlot].splice(addIndex, 0, args.source.node.id)
      } else {
        clonedTargetParentNode.slots[addSlot].push(args.source.node.id)
      }

      clonedSourceParentNode.slots[removeSlot].splice(removeIndex, 1)

      return context.updateMany({ entries: [clonedSourceParentNode, clonedTargetParentNode] })
    },
    onSuccess: ([sourceData, targetData], vars) => {
      context.queryClient.invalidateQueries({ queryKey: [vars.source.parent.node.store, sourceData] })
      context.queryClient.invalidateQueries({ queryKey: [vars.target.parent.node.store, targetData] })
    },
  })

  useEffect(() => {
    return monitorForElements({
      onDrop: async ({ source, location }) => {
        const [target] = location.current.dropTargets

        if (isDragDrop.block.target(target.data) || isDrop.block.target(target.data)) {
          if (isComponentItemSource(source.data)) {
            handleAddBlock.mutate({ source: source.data, target: target.data })
          }
          if (isDragDrop.template.source(source.data)) {
            handleApplyTemplate.mutate({ source: source.data, target: target.data })
          }
          if (isDragDrop.block.source(source.data)) {
            const sameParent =
              source.data.parent.node.id === target.data.parent.node.id && source.data.parent.node.store === target.data.parent.node.store

            if (sameParent) {
              handleReorderBlock.mutate({ source: source.data, target: target.data })
            } else {
              handleReparentBlock.mutate({ source: source.data, target: target.data })
            }
          }
        }

        if (isDragDrop.template.target(target.data)) {
          if (isDragDrop.template.source(source.data)) {
            handleReorderTemplates.mutate({ source: source.data, target: target.data })
          }
        }
        if (isDrop.template.target(target.data) || isDragDrop.template.target(target.data)) {
          if (isDragDrop.block.source(source.data)) {
            handleAddTemplate.mutate({ source: source.data, target: target.data })
          }
        }
      },
    })
  }, [])

  const pending = handleAddBlock.isPending || handleReparentBlock.isPending || handleReorderBlock.isPending

  return { pending }
}
