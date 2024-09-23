import { useMutation } from '@tanstack/react-query'
import { duplicateTree, getTree } from '../api'
import { useRouteContext } from '@tanstack/react-router'
import { DragData } from './useDrag'
import { Edge } from './useDrop'
import { Block, Page } from '../db'

export function useTemplateApply() {
  const context = useRouteContext({ from: '/pages/$id' })
  return {
    templateApply: useMutation({
      mutationKey: ['canvas', 'template', 'apply'],
      mutationFn: async (args: {
        source: DragData['template']
        target: {
          parent: { slot: string; node: Page | Block }
          index?: number
          edge: Edge
        }
      }) => {
        const clonedParentNode = structuredClone(args.target.parent.node)
        const tree = await getTree({ root: { id: args.source.node.slots.root[0], store: 'blocks' } })
        const rootEntry = await duplicateTree({ tree })
        const addSlot = args.target.parent.slot
        if (args.target.index !== undefined && args.target.edge) {
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
    }),
  }
}
