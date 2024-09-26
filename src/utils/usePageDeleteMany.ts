import { useRouteContext } from '@tanstack/react-router'
import { Page } from '../db'
import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'

export function usePageDeleteMany() {
  const context = useRouteContext({ from: '/pages/' })
  const { toast } = useToast()
  return {
    pageDeleteMany: useMutation({
      mutationKey: ['page', 'delete'],
      mutationFn: async (args: { entries: Array<Page> }) => {
        let accum = []
        for (const entry of args.entries) {
          const tree = await context.getTree({ root: { store: 'pages', id: entry.id }, entries: [] })
          accum.push(...tree)
        }
        await context.removeMany({ entries: accum })
      },
      onSuccess: async () => {
        await context.queryClient.invalidateQueries({ queryKey: ['pages'] })
        toast({ description: 'Pages deleted' })
      },
      onError: (e) => {
        toast({ title: 'Pages deletion failed', variant: 'destructive', description: e?.message })
      },
    }),
  }
}
