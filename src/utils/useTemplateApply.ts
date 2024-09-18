import { useMutation } from '@tanstack/react-query'
import { DragDrop } from './useDragDrop'
import { Drop } from './useDrop'
import { duplicateTree, getTree } from '../api'
import { useRouteContext } from '@tanstack/react-router'

export function useTemplateApply() {
  const context = useRouteContext({ from: '/experiences/$id' })
  return useMutation({
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
}
