import { context } from '#main.tsx'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { type DBStores } from '@repo/lib'

type Args = { id: DBStores['Page']['id'] }

export function usePageCopy() {
  const mutation = useMutation({
    mutationKey: ['page', 'copy'],
    mutationFn: async (args: Args) => {
      const entries = await context.getTree({ root: { store: 'pages', id: args.id } })
      return context.duplicateTree({ tree: entries })
    },
    onSuccess: async () => {
      context.queryClient.invalidateQueries({ queryKey: ['pages'] })
    },
  })

  async function pageCopy(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, {
      loading: 'Duplicating page...',
      success: 'Duplicated page',
      error: 'Duplicating page failed',
    })
    return promise
  }

  return { pageCopy }
}
