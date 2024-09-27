import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { Page } from '@/db'
import { useToast } from '@/hooks/use-toast'

export function usePageUpdateName() {
  const context = useRouteContext({ from: '/pages/$id' })
  const { toast } = useToast()

  return {
    pageUpdateName: useMutation({
      mutationKey: ['page', 'update', 'name'],
      mutationFn: (args: { page: Page; name: string }) => {
        const clonedEntry = structuredClone(args.page)
        const date = new Date()
        clonedEntry.updatedAt = date
        clonedEntry.name = args.name
        return context.update({ entry: clonedEntry })
      },
      onSuccess: (id) => {
        context.queryClient.invalidateQueries({
          queryKey: ['pages', id],
        })
        toast({ description: 'Page updated' })
      },
      onError: (e) => {
        toast({ title: 'Page not updated', variant: 'destructive', description: e?.message })
      },
    }),
  }
}
