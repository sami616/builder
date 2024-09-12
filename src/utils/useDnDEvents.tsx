import { useEffect } from 'react'
import { DroppableRootTarget, type DroppableTarget, isDroppableRootTarget, isDroppableTarget } from '../utils/useDroppable'
import { type ComponentItemSource, isComponentItemSource } from '../editor-components/ComponentItem'
import { isSlotItemSource, isSlotItemTarget, type SlotItemSource, type SlotItemTarget } from '../utils/useSlotItem'
import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'

export function useDnDEvents() {
  const context = useRouteContext({ from: '/experiences/$id' })

  const handleAddTemplate = useMutation({
    mutationFn: async (args: { source: SlotItemSource; target: DroppableRootTarget }) => {
      const tree = await context.getTree({ root: { store: 'blocks', id: args.source.block.id } })
      const rootEntry = await context.duplicateTree({ tree })

      const date = new Date()
      return context.add({
        entry: {
          name: args.source.block.name,
          store: 'templates',
          createdAt: date,
          updatedAt: date,
          slots: { root: [rootEntry.id] },
        },
      })
    },
    onSuccess: (data) => {
      context.queryClient.invalidateQueries({ queryKey: ['templates', data] })
    },
  })

  const handleAdd = useMutation({
    mutationFn: async (args: { source: ComponentItemSource; target: SlotItemTarget | DroppableTarget }) => {
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
      if ('index' in args.target) {
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

  const handleReorder = useMutation({
    mutationFn: async (args: { source: SlotItemSource; target: SlotItemTarget | DroppableTarget }) => {
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
        clonedParentNode.slots[addSlot].splice(addIndex, 0, args.source.block.id)
      } else {
        clonedParentNode.slots[addSlot].push(args.source.block.id)
      }

      clonedParentNode.slots[removeSlot].splice(removeIndex, 1)
      return context.update({ entry: clonedParentNode })
    },
    onSuccess: (data, vars) => {
      context.queryClient.invalidateQueries({ queryKey: [vars.target.parent.node.store, data] })
    },
  })

  const handleReparent = useMutation({
    mutationFn: async (args: { source: SlotItemSource; target: SlotItemTarget | DroppableTarget }) => {
      const clonedSourceParentNode = structuredClone(args.source.parent.node)
      const clonedTargetParentNode = structuredClone(args.target.parent.node)
      const addSlot = args.target.parent.slot
      const removeSlot = args.source.parent.slot
      let removeIndex = args.source.index

      if ('index' in args.target) {
        let addIndex = args.target.index
        let { edge } = args.target
        if (edge === 'bottom') addIndex += 1
        clonedTargetParentNode.slots[addSlot].splice(addIndex, 0, args.source.block.id)
      } else {
        clonedTargetParentNode.slots[addSlot].push(args.source.block.id)
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

        if (isSlotItemTarget(target.data) || isDroppableTarget(target.data)) {
          if (isComponentItemSource(source.data)) {
            handleAdd.mutate({ source: source.data, target: target.data })
          }
          if (isSlotItemSource(source.data)) {
            const sameParent = source.data.parent.node.id === target.data.parent.node.id
            if (sameParent) {
              handleReorder.mutate({ source: source.data, target: target.data })
            } else {
              handleReparent.mutate({ source: source.data, target: target.data })
            }
          }
        }
        if (isSlotItemSource(source.data) && isDroppableRootTarget(target.data)) {
          handleAddTemplate.mutate({ source: source.data, target: target.data })
        }
      },
    })
  }, [])

  const pending = handleAdd.isPending || handleReparent.isPending || handleReorder.isPending

  return { pending }
}
