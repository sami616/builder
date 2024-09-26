import { useToast } from '@/hooks/use-toast'
import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'

export function usePageAdd() {
  const context = useRouteContext({ from: '/pages/' })
  const { toast } = useToast()
  return {
    pageAdd: useMutation({
      mutationKey: ['page', 'add'],
      mutationFn: context.add,
      onSuccess: async () => {
        context.queryClient.invalidateQueries({ queryKey: ['pages'] })
        toast({ description: 'Page created' })
      },
      onError: (e) => {
        toast({ title: 'Page creation failed', variant: 'destructive', description: e?.message })
      },
    }),
  }
}
