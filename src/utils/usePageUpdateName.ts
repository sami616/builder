import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { Page } from '../db'

export function usePageUpdateName() {
  const context = useRouteContext({ from: '/pages/$id' })

  return {
    pageUpdateName: useMutation({
      mutationKey: ['page', 'update', 'name'],
      mutationFn: (args: { page: Page; name: string }) => {
        const clonedEntry = structuredClone(args.page)
        clonedEntry.name = args.name
        return context.update({ entry: clonedEntry })
      },
      onSuccess: (id) => {
        context.queryClient.invalidateQueries({
          queryKey: ['pages', id],
        })
      },
    }),
  }
}
