import { useRouteContext } from '@tanstack/react-router'
import { Page } from '../db'
import { useMutation } from '@tanstack/react-query'

export function usePageDelete() {
  const context = useRouteContext({ from: '/pages/' })
  return {
    pageDelete: useMutation({
      mutationKey: ['page', 'delete'],
      mutationFn: async (args: { entry: Page }) => {
        const entries = await context.getTree({ root: { store: 'pages', id: args.entry.id }, entries: [] })
        await context.removeMany({ entries })
      },
      onSuccess: () => {
        context.queryClient.invalidateQueries({ queryKey: ['pages'] })
      },
    }),
  }
}
