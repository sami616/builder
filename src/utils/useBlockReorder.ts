import { useMutation } from '@tanstack/react-query'
import { DragDrop } from './useDragDrop'
import { Drop } from './useDrop'
import { useRouteContext } from '@tanstack/react-router'

export function useBlockReorder() {
  const context = useRouteContext({ from: '/experiences/$id' })
  return useMutation({
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
}
