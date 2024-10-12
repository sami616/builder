import { useRouteContext } from '@tanstack/react-router'
import { Page } from '@/db'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

type Args = { entries: Array<Page> }

export function usePageDeleteMany() {
  const context = useRouteContext({ from: '/pages/' })
  const mutation = useMutation({
    mutationKey: ['page', 'delete'],
    mutationFn: async (args: Args) => {
      let accum = []
      for (const entry of args.entries) {
        const tree = await context.getTree({ root: { store: 'pages', id: entry.id }, entries: [] })
        accum.push(...tree)
      }
      await context.removeMany({ entries: accum })
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
