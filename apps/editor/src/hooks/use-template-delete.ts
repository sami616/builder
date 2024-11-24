import { db } from '#db.ts'
import { useActive } from '#hooks/use-active.tsx'
import { context } from '#main.tsx'
import { DBStores } from '@repo/lib'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

type Args = { template: DBStores['Template'] }

export function useTemplateDelete() {
  const { setActive } = useActive()
  const mutation = useMutation({
    mutationKey: ['canvas', 'template', 'delete'],
    mutationFn: async (args: Args) => {
      const tree = await context.getTree({ root: { store: 'templates', id: args.template.id } })
      const removed = context.removeMany({ entries: tree })

      const tx = db.transaction('templates', 'readwrite')
      const order = args.template.order
      const index = tx.store.index('order')
      const range = IDBKeyRange.lowerBound(order)
      let cursor = await index.openCursor(range, 'next')

      while (cursor) {
        const item = cursor.value
        item.order = item.order - 1
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

  async function templateDelete(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, { loading: 'Deleting template...', success: 'Deleted template', error: 'Deleting template failed' })
    return promise
  }

  return { templateDelete }
}
