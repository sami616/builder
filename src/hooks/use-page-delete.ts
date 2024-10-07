import { useRouteContext } from '@tanstack/react-router'
import { Page } from '@/db'
import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'

export function usePageDelete() {
  const context = useRouteContext({ from: '/pages/' })
  const { toast } = useToast()
  return {
    pageDelete: useMutation({
      mutationKey: ['page', 'delete'],
      mutationFn: async (args: { entry: Page }) => {
        const entries = await context.getTree({ root: { store: 'pages', id: args.entry.id }, entries: [] })
        await context.removeMany({ entries })
      },
      onSuccess: () => {
        context.queryClient.invalidateQueries({ queryKey: ['pages'] })
        toast({ description: 'Page deleted' })
      },
      onError: (e) => {
        toast({ title: 'Page deletion failed', variant: 'destructive', description: e?.message })
      },
    }),
  }
}
