import { useBlockReparent } from '@/hooks/use-block-reparent'
import { useBlockReorder } from '@/hooks/use-block-reorder'
import { DragData } from '@/hooks/use-drag'
import { Block, Page } from '@/db'
import { Edge } from '@/hooks/use-drop'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

type Args = {
  source: DragData['block']
  target: { parent: { slot: string; node: Page | Block }; edge: Edge; index?: number }
}

export function useBlockMove() {
  const { blockReparent } = useBlockReparent()
  const { blockReorder } = useBlockReorder()

  const mutation = useMutation({
    mutationKey: ['canvas', 'block', 'move'],
    mutationFn: async (args: Args) => {
      const sameParentId = args.source.parent.node.id === args.target.parent.node.id
      const sameParentStore = args.source.parent.node.store === args.target.parent.node.store
      const sameParent = sameParentStore && sameParentId
      if (!sameParent) {
        blockReparent.mutate(args)
      } else {
        blockReorder.mutate(args)
      }
    },
  })

  async function blockMove(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, { loading: 'Moving layer...', success: 'Moved layer', error: 'Moving layer failed' })
    return promise
  }

  return { blockMove }
}
