import { useMutation } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { DragData } from '@/hooks/use-drag'
import { Block, Page } from '@/db'
import { Edge } from '@/hooks/use-drop'
import { isPage } from '@/api'
import { context } from '@/main'

export function useBlockReparent() {
  const params = useParams({ strict: false })

  return {
    blockReparent: useMutation({
      mutationKey: ['canvas', 'block', 'reparent'],
      mutationFn: async (args: {
        source: DragData['block']
        target: { parent: { slot: string; node: Block | Page }; edge: Edge; index?: number }
      }) => {
        const date = new Date()
        const clonedSourceParentNode = structuredClone(args.source.parent.node)
        const clonedTargetParentNode = structuredClone(args.target.parent.node)
        const addSlot = args.target.parent.slot
        const removeSlot = args.source.parent.slot
        let removeIndex = args.source.index

        if (args.target.index !== undefined && args.target.edge) {
          let addIndex = args.target.index
          let { edge } = args.target
          if (edge === 'bottom') addIndex += 1
          clonedTargetParentNode.slots[addSlot].splice(addIndex, 0, args.source.node.id)
        } else {
          clonedTargetParentNode.slots[addSlot].push(args.source.node.id)
        }
        clonedSourceParentNode.slots[removeSlot].splice(removeIndex, 1)

        clonedSourceParentNode.updatedAt = date
        clonedTargetParentNode.updatedAt = date

        if (!isPage(clonedSourceParentNode) && !isPage(clonedTargetParentNode) && params.id) {
          const page = context.queryClient.getQueryData<Page>(['pages', Number(params.id)])
          if (page) await context.update({ entry: { ...page, updatedAt: date } })
        }

        return context.updateMany({ entries: [clonedSourceParentNode, clonedTargetParentNode] })
      },
      onSuccess: ([sourceData, targetData], vars) => {
        context.queryClient.invalidateQueries({ queryKey: [vars.source.parent.node.store, sourceData] })
        context.queryClient.invalidateQueries({ queryKey: [vars.target.parent.node.store, targetData] })
        if (!isPage(vars.source.parent.node) && !isPage(vars.target.parent.node)) {
          context.queryClient.invalidateQueries({ queryKey: ['pages'] })
        }
      },
    }),
  }
}
