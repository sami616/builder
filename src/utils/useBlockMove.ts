import { useBlockReparent } from './useBlockReparent'
import { useBlockReorder } from './useBlockReorder'
import { DragData } from './useDrag'
import { Block, Page } from '../db'
import { Edge } from './useDrop'
import { useMutation } from '@tanstack/react-query'

export function useBlockMove() {
  const { blockReparent } = useBlockReparent()
  const { blockReorder } = useBlockReorder()

  return {
    blockMove: useMutation({
      mutationKey: ['canvas', 'block', 'move'],
      mutationFn: async (args: {
        source: DragData['block']
        target: { parent: { slot: string; node: Page | Block }; edge: Edge; index?: number }
      }) => {
        const sameParentId = args.source.parent.node.id === args.target.parent.node.id
        const sameParentStore = args.source.parent.node.store === args.target.parent.node.store
        const sameParent = sameParentStore && sameParentId
        if (!sameParent) {
          blockReparent.mutate(args)
        } else {
          blockReorder.mutate(args)
        }
      },
    }),
  }
}
