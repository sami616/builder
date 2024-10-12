import { useRouteContext } from '@tanstack/react-router'
import { Page } from '@/db'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

type Args = { entry: Page }

export function usePageDelete() {
  const context = useRouteContext({ from: '/pages/' })
  const mutation = useMutation({
    mutationKey: ['page', 'delete'],
    mutationFn: async (args: Args) => {
      const entries = await context.getTree({ root: { store: 'pages', id: args.entry.id }, entries: [] })
      await context.removeMany({ entries })
    },
    onSuccess: () => {
      context.queryClient.invalidateQueries({ queryKey: ['pages'] })
    },
  })

  async function pageDelete(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, { loading: 'Deleting page...', success: 'Deleted page', error: 'Deleting page failed' })
    return promise
  }

  return { pageDelete }
}
