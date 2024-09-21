import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'

export function usePageAdd() {
  const context = useRouteContext({ from: '/experiences/' })
  return {
    pageAdd: useMutation({
      mutationKey: ['page', 'add'],
      mutationFn: context.add,
      onSuccess: () => {
        context.queryClient.invalidateQueries({ queryKey: ['experiences'] })
      },
    }),
  }
}
