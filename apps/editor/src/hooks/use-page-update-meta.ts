import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { Page } from '@/db'
import { toast } from 'sonner'

type Args = { page: Page } & Pick<Page, 'title' | 'description' | 'url' | 'slug'>

export function usePageUpdateMeta() {
  const context = useRouteContext({ from: '/pages/' })

  const mutation = useMutation({
    mutationKey: ['page', 'update', 'meta'],
    mutationFn: (args: Args) => {
      const clonedEntry = structuredClone(args.page)
      clonedEntry.title = args.title
      clonedEntry.description = args.description
      clonedEntry.slug = args.slug
      clonedEntry.url = args.url
      clonedEntry.updatedAt = new Date()
      clonedEntry.status = args.page.publishedAt ? 'Changed' : 'Draft'
      return context.update({ entry: clonedEntry })
    },
    onSuccess: () => {
      context.queryClient.invalidateQueries({
        queryKey: ['pages'],
      })
    },
  })

  async function pageUpdateMeta(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, { loading: 'Updating page...', success: 'Updated page', error: 'Updating page failed' })
    return promise
  }

  return { pageUpdateMeta }
}
