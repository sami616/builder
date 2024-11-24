import { DBStores } from '@repo/lib'
import { context } from '#main.tsx'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

type Args = { page: DBStores['Page'] } & Partial<Pick<DBStores['Page'], 'title' | 'description' | 'url' | 'slug' | 'status' | 'publishedAt'>>

export function usePageUpdateMeta() {
  const mutation = useMutation({
    mutationKey: ['page', 'update', 'meta'],
    mutationFn: (args: Args) => {
      const clonedEntry = structuredClone(args.page)
      if (args.title) clonedEntry.title = args.title
      if (args.description) clonedEntry.description = args.description
      if (args.slug) clonedEntry.slug = args.slug
      if (args.url) clonedEntry.url = args.url
      if (args.publishedAt) clonedEntry.publishedAt = args.publishedAt
      if (args.status) clonedEntry.status = args.status
      clonedEntry.updatedAt = new Date()
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
