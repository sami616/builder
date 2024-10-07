import { type ComponentProps } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { type Block } from '@/db'
import { BlockItem } from '@/components/editor/block-item'

export function useBlockDelete() {
  const context = useRouteContext({ from: '/pages/$id' })
  const { toast } = useToast()
  return {
    blockDelete: useMutation({
      mutationKey: ['canvas', 'block', 'delete'],
      mutationFn: async (args: { blockId: Block['id']; index: number; parent: ComponentProps<typeof BlockItem>['parent'] }) => {
        const entries = await context.getTree({ root: { id: args.blockId, store: 'blocks' } })
        await context.removeMany({ entries })
        const clonedParentNode = structuredClone(args.parent.node)
        clonedParentNode.slots[args.parent.slot].splice(args.index, 1)
        await context.update({ entry: clonedParentNode })
        return { store: clonedParentNode.store, id: args.parent.node.id }
      },
      onSuccess: async ({ store, id }) => {
        context.queryClient.invalidateQueries({ queryKey: [store, id] })
        toast({ description: 'Layer deleted' })
      },
      onError: (e) => {
        toast({ title: 'Layer deletion failed', variant: 'destructive', description: e?.message })
      },
    }),
  }
}
