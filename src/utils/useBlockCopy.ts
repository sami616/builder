import { useMutation } from '@tanstack/react-query'
import { type ComponentProps } from 'react'
import { BlockItem } from '../editor-components/BlockItem'
import { useRouteContext } from '@tanstack/react-router'

export function useBlockCopy() {
  const context = useRouteContext({ from: '/experiences/$id' })

  return {
    blockCopy: useMutation({
      mutationKey: ['canvas', 'block', 'copy'],
      mutationFn: async (args: {
        index: number
        root: Parameters<typeof context.getTree>[0]['root']
        parent: ComponentProps<typeof BlockItem>['parent']
      }) => {
        const tree = await context.getTree({ root: args.root })
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
