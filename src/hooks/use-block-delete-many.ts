import { type ComponentProps } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { type Block } from '@/db'
import { BlockItem } from '@/components/editor/block-item'
import { toast } from 'sonner'

type Args = { entries: Array<{ blockId: Block['id']; index: number; parent: ComponentProps<typeof BlockItem>['parent'] }> }

export function useBlockDeleteMany() {
  const context = useRouteContext({ from: '/pages/$id' })
  const mutation = useMutation({
    mutationKey: ['canvas', 'block', 'delete'],
    mutationFn: async (args: Args) => {
      const removeList = []
      const updateList = new Map<number, Args['entries'][number]['parent']['node']>() // Map to store each unique cloned parent node

      for (const entry of args.entries) {
        const tree = await context.getTree({ root: { store: 'blocks', id: entry.blockId }, entries: [] })
        removeList.push(...tree)

        let clonedParentNode
        if (updateList.has(entry.parent.node.id)) {
          // Use existing cloned parent if already processed
          clonedParentNode = updateList.get(entry.parent.node.id)
        } else {
          // Clone and store if seeing this parent for the first time
          clonedParentNode = structuredClone(entry.parent.node)
          updateList.set(entry.parent.node.id, clonedParentNode)
        }

        clonedParentNode?.slots[entry.parent.slot].splice(entry.index, 1)
      }

      await Promise.all([context.removeMany({ entries: removeList }), context.updateMany({ entries: Array.from(updateList.values()) })])

      return { updateList: Array.from(updateList.values()) }
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
