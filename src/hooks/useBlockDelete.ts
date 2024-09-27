import { type ComponentProps } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { type Block } from '@/db'
import { BlockItem } from '@/components/editor/BlockItem'

export function useBlockDelete() {
  const context = useRouteContext({ from: '/pages/$id' })
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
      },
    }),
  }
}
