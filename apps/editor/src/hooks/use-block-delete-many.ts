import { isPage } from '#api.ts'
import { BlockItem } from '#components/editor/block-item.tsx'
import { type Page, type Block } from '#db.ts'
import { useActive } from '#hooks/use-active.tsx'
import { context } from '#main.tsx'
import { useMutation } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { type ComponentProps } from 'react'
import { toast } from 'sonner'

type Args = { entries: Array<{ id: Block['id']; index: number; parent: ComponentProps<typeof BlockItem>['parent'] }> }

export function useBlockDeleteMany() {
  const params = useParams({ strict: false })
  const { setActive } = useActive()
  const mutation = useMutation({
    mutationKey: ['canvas', 'block', 'delete'],
    mutationFn: async (args: Args) => {
      const date = new Date()
      const removeList = []
      const updateList = new Map<number, Args['entries'][number]['parent']['node']>() // Map to store each unique cloned parent node
      // sort to process deletions from the highest index to the lowest,
      // you avoid shifting indices that haven’t yet been processed,
      // as deletions will only affect subsequent indices in the array.
      // This ensures that each index value still accurately points to the correct element.
      const sortedEntries = args.entries.sort((a, b) => b.index - a.index)

      for (const entry of sortedEntries) {
        const tree = await context.getTree({ root: { store: 'blocks', id: entry.id }, entries: [] })
        removeList.push(...tree)

        const clonedParentNode = updateList.get(entry.parent.node.id) ?? structuredClone(entry.parent.node)
        clonedParentNode?.slots[entry.parent.slot].splice(entry.index, 1)
        clonedParentNode.updatedAt = date
        updateList.set(entry.parent.node.id, clonedParentNode)
      }

      const hasPage = Array.from(updateList.values()).some((item) => isPage(item))
      if (!hasPage && params.id) {
        const page = context.queryClient.getQueryData<Page>(['pages', Number(params.id)])
        if (page) await context.update({ entry: { ...page, updatedAt: date } })
      }

      await Promise.all([context.removeMany({ entries: removeList }), context.updateMany({ entries: Array.from(updateList.values()) })])

      return { updateList: Array.from(updateList.values()), hasPage }
    },
    onSuccess: async ({ updateList, hasPage }) => {
      updateList.forEach((item) => {
        context.queryClient.invalidateQueries({ queryKey: [item.store, item.id] })
      })
      if (!hasPage) {
        context.queryClient.invalidateQueries({ queryKey: ['pages'] })
      }
      setActive({ store: 'none', items: [] })
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
