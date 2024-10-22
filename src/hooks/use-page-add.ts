import { Page } from '@/db'
import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { toast } from 'sonner'

type Args = { entry: Omit<Page, 'id'> }

export function usePageAdd() {
  const context = useRouteContext({ from: '/pages/' })
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
