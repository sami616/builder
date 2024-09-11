import { type ComponentProps } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { type Block } from '../db'
import { BlockItem } from '../editor-components/BlockItem'

export function useRemoveBlock() {
  const context = useRouteContext({ from: '/experiences/$id' })
  const removeBlock = useMutation({
    mutationFn: async (args: { blockId: Block['id']; parent: ComponentProps<typeof BlockItem>['parent'] }) => {
      const entries = await context.getTree({ root: { id: args.blockId, store: 'blocks' } })
      await context.removeMany({ entries })
      const clonedParentNode = structuredClone(args.parent.node)
      clonedParentNode.slots[args.parent.slot] = args.parent.node.slots[args.parent.slot].filter((id) => id !== args.blockId)
      await context.update({ entry: clonedParentNode })
      return { store: context.getStore(clonedParentNode), id: args.parent.node.id }
    },
    onSuccess: async ({ store, id }) => {
      context.queryClient.invalidateQueries({ queryKey: [store, id] })
    },
  })

  return removeBlock
}
