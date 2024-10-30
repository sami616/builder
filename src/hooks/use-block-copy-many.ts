import { useMutation } from '@tanstack/react-query'
import { type ComponentProps } from 'react'
import { BlockItem } from '@/components/editor/block-item'
import { useRouteContext } from '@tanstack/react-router'
import { Block } from '@/db'
import { toast } from 'sonner'

type Args = { index: number; id: Block['id']; parent: ComponentProps<typeof BlockItem>['parent'] }

export function useBlockCopy() {
  const context = useRouteContext({ from: '/pages/$id' })

  const mutation = useMutation({
    mutationKey: ['canvas', 'block', 'copy'],
    mutationFn: async (args: Args) => {
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
  })

  async function blockCopy(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, {
      loading: 'Duplicating layer...',
      success: 'Duplicated layer',
      error: 'Duplicating layer failed',
    })
    return promise
  }

  return { blockCopy }
}
