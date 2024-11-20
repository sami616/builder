import { type Page } from '#db.ts'
import { context } from '#main.tsx'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

type Args = { entry: Omit<Page, 'id'> }

export function usePageAdd() {
  const mutation = useMutation({
    mutationKey: ['page', 'add'],
    mutationFn: (args: Args) => {
      return context.add(args)
    },
    onSuccess: async () => {
      context.queryClient.invalidateQueries({ queryKey: ['pages'] })
    },
  })

  async function pageAdd(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, { loading: 'Creating page...', success: 'Created page', error: 'Creating page failed' })
    return promise
  }

  return { pageAdd }
}
