import { context } from '#main.tsx'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { type DBStores } from '@repo/lib'

type Args = { entries: Array<DBStores['Page']> }

export function usePageDeleteMany() {
  const mutation = useMutation({
    mutationKey: ['page', 'delete'],
    mutationFn: async (args: Args) => {
      let trees = []
      for (const entry of args.entries) {
        const tree = await context.getTree({ root: { store: 'pages', id: entry.id }, entries: [] })
        trees.push(...tree)
      }
      await context.removeMany({ entries: trees })
    },
    onSuccess: async () => {
      await context.queryClient.invalidateQueries({ queryKey: ['pages'] })
    },
  })

  async function pageDeleteMany(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, { loading: 'Deleting pages...', success: 'Deleted pages', error: 'Deleting pages failed' })
    return promise
  }

  return { pageDeleteMany }
}
