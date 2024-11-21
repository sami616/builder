import { type DBStores } from '@repo/lib'
import { context } from '#main.tsx'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

type Args = { ids: Array<DBStores['Page']['id']> }

export function usePageCopyMany() {
  const mutation = useMutation({
    mutationKey: ['page', 'copy'],
    mutationFn: async (args: Args) => {
      for (const id of args.ids) {
        const entries = await context.getTree({ root: { store: 'pages', id } })
        await context.duplicateTree({ tree: entries })
      }
    },
    onSuccess: async () => {
      context.queryClient.invalidateQueries({ queryKey: ['pages'] })
    },
  })

  async function pageCopyMany(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, {
      loading: 'Duplicating pages...',
      success: 'Duplicated pages',
      error: 'Duplicating pages failed',
    })
    return promise
  }

  return { pageCopyMany }
}
