import { useMutation } from '@tanstack/react-query'
import { type ComponentProps } from 'react'
import { BlockItem } from '@/components/editor/block-item'
import { useParams, useRouteContext } from '@tanstack/react-router'
import { Block, Page } from '@/db'
import { toast } from 'sonner'
import { isPage } from '@/api'

type Args = { entries: Array<{ index: number; id: Block['id']; parent: ComponentProps<typeof BlockItem>['parent'] }> }

export function useBlockCopyMany() {
  const context = useRouteContext({ from: '/_layout/pages/$id/' })
  const params = useParams({ from: '/_layout/pages/$id/' })

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

      const hasPage = Array.from(updateList.values()).some((item) => isPage(item))
      if (!hasPage) {
        const page = context.queryClient.getQueryData<Page>(['pages', Number(params.id)])
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
