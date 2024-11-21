import { is, type DBStores } from '@repo/lib'
import { BlockItem } from '#components/editor/block-item.tsx'
import { context } from '#main.tsx'
import { useMutation } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { type ComponentProps } from 'react'
import { toast } from 'sonner'

type Args = { entries: Array<{ index: number; id: DBStores['Block']['id']; parent: ComponentProps<typeof BlockItem>['parent'] }> }

export function useBlockCopyMany() {
  const params = useParams({ strict: false })

  const mutation = useMutation({
    mutationKey: ['canvas', 'block', 'copyMany'],
    mutationFn: async (args: Args) => {
      const updateList = new Map<number, Args['entries'][number]['parent']['node']>() // Map to store each unique cloned parent node

      // Sort blocks by index in descending order to maintain positions during splicing
      const sortedEntries = args.entries.sort((a, b) => b.index - a.index)

      const date = new Date()

      for (const entry of sortedEntries) {
        // Duplicate the block's tree and get the root entry for each block in args
        const tree = await context.getTree({ root: { store: 'blocks', id: entry.id } })
        const rootEntry = await context.duplicateTree({ tree })

        // Clone the parent node if not already cloned, or retrieve the existing cloned version
        const clonedParentNode = updateList.get(entry.parent.node.id) ?? structuredClone(entry.parent.node)
        clonedParentNode.slots[entry.parent.slot].splice(entry.index + 1, 0, rootEntry.id)
        clonedParentNode.updatedAt = date

        // Update the cloned parent node in the map to ensure latest modifications are retained
        updateList.set(entry.parent.node.id, clonedParentNode)
      }

      const hasPage = Array.from(updateList.values()).some((item) => is.page(item))
      if (!hasPage && params.id) {
        const page = context.queryClient.getQueryData<DBStores['Page']>(['pages', Number(params.id)])
        if (page) await context.update({ entry: { ...page, updatedAt: date } })
      }

      // Update all modified parent nodes at once
      await context.updateMany({ entries: Array.from(updateList.values()) })

      // Return data to invalidate queries for each updated parent
      return { hasPage, updateList: Array.from(updateList.values()) }
    },
    onSuccess: async ({ updateList, hasPage }) => {
      updateList.forEach((item) => {
        context.queryClient.invalidateQueries({ queryKey: [item.store, item.id] })
      })
      if (!hasPage) {
        context.queryClient.invalidateQueries({ queryKey: ['pages'] })
      }
    },
  })

  async function blockCopyMany(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, {
      loading: 'Duplicating layers...',
      success: 'Duplicated layers',
      error: 'Duplicating layers failed',
    })
    return promise
  }

  return { blockCopyMany }
}
