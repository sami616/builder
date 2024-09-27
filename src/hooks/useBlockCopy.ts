import { useMutation } from '@tanstack/react-query'
import { type ComponentProps } from 'react'
import { BlockItem } from '@/components/editor/BlockItem'
import { useRouteContext } from '@tanstack/react-router'
import { Block } from '@/db'

export function useBlockCopy() {
  const context = useRouteContext({ from: '/pages/$id' })

  return {
    blockCopy: useMutation({
      mutationKey: ['canvas', 'block', 'copy'],
      mutationFn: async (args: { index: number; id: Block['id']; parent: ComponentProps<typeof BlockItem>['parent'] }) => {
        const tree = await context.getTree({ root: { store: 'blocks', id: args.id } })
        const rootEntry = await context.duplicateTree({ tree })
        const clonedParent = structuredClone(args.parent.node)
        clonedParent.slots[args.parent.slot].splice(args.index + 1, 0, rootEntry.id)
        await context.update({ entry: clonedParent })
        return { store: clonedParent.store, id: args.parent.node.id }
      },
      onSuccess: async ({ store, id }) => {
        context.queryClient.invalidateQueries({ queryKey: [store, id] })
      },
    }),
  }
}
