import { type ComponentProps } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { type Block } from '@/db'
import { BlockItem } from '@/components/editor/block-item'
import { toast } from 'sonner'
import { updateMany } from '@/api'

type Args = { entries: Array<{ blockId: Block['id']; index: number; parent: ComponentProps<typeof BlockItem>['parent'] }> }

export function useBlockDeleteMany() {
  const context = useRouteContext({ from: '/pages/$id' })
  const mutation = useMutation({
    mutationKey: ['canvas', 'block', 'delete'],
    mutationFn: async (args: Args) => {
      let removeList = []
      let updateList = []
      for (const entry of args.entries) {
        const tree = await context.getTree({ root: { store: 'blocks', id: entry.blockId }, entries: [] })
        removeList.push(...tree)
        const clonedParentNode = structuredClone(entry.parent.node)
        clonedParentNode.slots[entry.parent.slot].splice(entry.index, 1)
        updateList.push(clonedParentNode)
      }

      await context.removeMany({ entries: removeList })
      await context.updateMany({ entries: updateList })

      // await Promise.all([context.removeMany({ entries: removeList }), context.updateMany({ entries: updateList })])

      return { updateList }
    },
    onSuccess: async ({ updateList }) => {
      updateList.forEach((item) => {
        context.queryClient.invalidateQueries({ queryKey: [item.store, item.id] })
      })
    },
  })

  async function blockDeleteMany(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, {
      loading: 'Deleting layers...',
      success: 'Deleted layers',
      error: 'Deleting layers failed',
    })
    return promise
  }

  return { blockDeleteMany }
}
