import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { DragDrop } from './useDragDrop'
import { Drop } from './useDrop'

export function useBlockReparent() {
  const context = useRouteContext({ from: '/experiences/$id' })
  return useMutation({
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
}
