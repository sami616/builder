import { useRouteContext } from '@tanstack/react-router'
import { Experience } from '../db'
import { useMutation } from '@tanstack/react-query'

export function usePageDelete() {
  const context = useRouteContext({ from: '/experiences/' })
  return {
    pageDelete: useMutation({
      mutationKey: ['page', 'delete'],
      mutationFn: async (args: { entry: Experience }) => {
        const entries = await context.getTree({ root: { store: 'experiences', id: args.entry.id }, entries: [] })
        await context.removeMany({ entries })
      },
      onSuccess: () => {
        context.queryClient.invalidateQueries({ queryKey: ['experiences'] })
      },
    }),
  }
}
