import { type DBStores, is } from '@repo/lib'
import { type DragData } from '#hooks/use-drag.ts'
import { type Edge } from '#hooks/use-drop.ts'
import { context } from '#main.tsx'
import { useMutation } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'

export function useBlockReorder() {
  const params = useParams({ strict: false })
  return {
    blockReorder: useMutation({
      mutationKey: ['canvas', 'block', 'reorder'],
      mutationFn: async (args: {
        source: DragData['block']
        target: { parent: { slot: string; node: DBStores['Page'] | DBStores['Block'] }; edge: Edge; index?: number }
      }) => {
        const date = new Date()
        const clonedParentNode = structuredClone(args.target.parent.node)
        const addSlot = args.target.parent.slot
        const removeSlot = args.source.parent.slot
        let removeIndex = args.source.index

        if (args.target.index !== undefined && args.target.edge) {
          let { edge } = args.target
          let addIndex = args.target.index
          if (edge === 'bottom') addIndex += 1
          // adjust removeIndex by 1 when reordering in same slot seeing as we add first, then remove
          if (removeSlot === addSlot && removeIndex >= addIndex) removeIndex += 1
          clonedParentNode.slots[addSlot].splice(addIndex, 0, args.source.node.id)
        } else {
          clonedParentNode.slots[addSlot].push(args.source.node.id)
        }

        clonedParentNode.updatedAt = date
        clonedParentNode.slots[removeSlot].splice(removeIndex, 1)

        if (!is.page(clonedParentNode) && params.id) {
          const page = context.queryClient.getQueryData<DBStores['Page']>(['pages', Number(params.id)])
          if (page) await context.update({ entry: { ...page, updatedAt: date } })
        }

        return context.update({ entry: clonedParentNode })
      },
      onSuccess: (data, vars) => {
        context.queryClient.invalidateQueries({ queryKey: [vars.target.parent.node.store, data] })
        if (!is.page(vars.target.parent.node)) {
          context.queryClient.invalidateQueries({ queryKey: ['pages'] })
        }
      },
    }),
  }
}
