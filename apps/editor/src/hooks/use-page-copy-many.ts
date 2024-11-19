import { Page } from '#db.ts'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { context } from '#main.tsx'

type Args = { ids: Array<Page['id']> }

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
