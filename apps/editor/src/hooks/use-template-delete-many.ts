import { useMutation } from '@tanstack/react-query'
import { db, type Template } from '#db.ts'
import { context } from '#main.tsx'
import { toast } from 'sonner'
import { useActive } from '#hooks/use-active.tsx'

type Args = { entries: Array<Template> }

export function useTemplateDeleteMany() {
  const { setActive } = useActive()
  const mutation = useMutation({
    mutationKey: ['canvas', 'template', 'deleteMany'],
    mutationFn: async (args: Args) => {
      // Remove the specified templates and their related data
      const removeList = []
      for (const template of args.entries) {
        const tree = await context.getTree({ root: { store: 'templates', id: template.id } })
        removeList.push(...tree)
      }

      const removed = context.removeMany({ entries: removeList })

      const tx = db.transaction('templates', 'readwrite')
      const index = tx.store.index('order')
      const orderValues = args.entries.map((template) => template.order)
      const minOrder = Math.min(...orderValues)

      // Adjust order for remaining templates after the deletions
      const range = IDBKeyRange.lowerBound(minOrder)
      let cursor = await index.openCursor(range, 'next')

      while (cursor) {
        const item = cursor.value
        item.order -= orderValues.filter((order) => order < item.order).length
        await cursor.update(item)
        cursor = await cursor.continue()
      }

      return removed
    },
    onSuccess: () => {
      context.queryClient.invalidateQueries({ queryKey: ['templates'] })
      setActive({ store: 'none', items: [] })
    },
  })

  async function templateDeleteMany(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, {
      loading: 'Deleting templates...',
      success: 'Deleted templates',
      error: 'Deleting templates failed',
    })
    return promise
  }

  return { templateDeleteMany }
}
