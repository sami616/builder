import { useBlockReparent } from '@/hooks/use-block-reparent'
import { useToast } from '@/hooks/use-toast'
import { useBlockReorder } from '@/hooks/use-block-reorder'
import { DragData } from '@/hooks/use-drag'
import { Block, Page } from '@/db'
import { Edge } from '@/hooks/use-drop'
import { useMutation } from '@tanstack/react-query'

export function useBlockMove() {
  const { blockReparent } = useBlockReparent()
  const { blockReorder } = useBlockReorder()
  const { toast } = useToast()

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
      onSuccess: async () => {
        toast({ description: 'Layer moved' })
      },
      onError: (e) => {
        toast({ title: 'Layer move failed', variant: 'destructive', description: e?.message })
      },
    }),
  }
}
