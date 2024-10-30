import { useMutation } from '@tanstack/react-query'
import { db, type Template } from '@/db'
import { useRouteContext } from '@tanstack/react-router'
import { toast } from 'sonner'

type Args = { entries: Array<Template> }

export function useTemplateDeleteMany() {
  const context = useRouteContext({ from: '/pages/$id' })
  const mutation = useMutation({
    mutationKey: ['canvas', 'template', 'deleteMany'],
    mutationFn: async (args: Args) => {
      const tx = db.transaction('templates', 'readwrite')
      const index = tx.store.index('order')
      const orderValues = args.entries.map((template) => template.order)
      const minOrder = Math.min(...orderValues)

      // Open a cursor to decrement order for all templates after the lowest order in args
      const range = IDBKeyRange.lowerBound(minOrder)
      let cursor = await index.openCursor(range, 'next')

      while (cursor) {
        const item = cursor.value
        // Skip items we're deleting, adjust order only for other items after deletions
        if (!orderValues.includes(item.order)) {
          item.order -= orderValues.filter((order) => order < item.order).length
          await cursor.update(item)
        }
        cursor = await cursor.continue()
      }

      // Remove the specified templates and their related data
      const removeList = []
      for (const template of args.entries) {
        const tree = await context.getTree({ root: { store: 'templates', id: template.id } })
        removeList.push(...tree)
      }

      return context.removeMany({ entries: removeList })
    },
    onSuccess: () => {
      context.queryClient.invalidateQueries({ queryKey: ['templates'] })
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
