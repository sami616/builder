import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { Page } from '@/db'
import { toast } from 'sonner'

type Args = { page: Page; name: string }

export function usePageUpdateName() {
  const context = useRouteContext({ from: '/pages/$id' })

  const mutation = useMutation({
    mutationKey: ['page', 'update', 'name'],
    mutationFn: (args: Args) => {
      const clonedEntry = structuredClone(args.page)
      const date = new Date()
      clonedEntry.updatedAt = date
      clonedEntry.title = args.name
      return context.update({ entry: clonedEntry })
    },
    onSuccess: (id) => {
      context.queryClient.invalidateQueries({
        queryKey: ['pages', id],
      })
    },
  })

  async function pageUpdateName(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, { loading: 'Updating page...', success: 'Updated page', error: 'Updating page failed' })
    return promise
  }

  return { pageUpdateName }
}
