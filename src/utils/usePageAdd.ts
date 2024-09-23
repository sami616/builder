import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'

export function usePageAdd() {
  const context = useRouteContext({ from: '/pages/' })
  return {
    pageAdd: useMutation({
      mutationKey: ['page', 'add'],
      mutationFn: context.add,
      onSuccess: () => {
        context.queryClient.invalidateQueries({ queryKey: ['pages'] })
      },
    }),
  }
}
