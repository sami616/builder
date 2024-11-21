// import {
//    Resolved,
//   resolveTree,
// } from '#api.ts'
import { DBStores } from '@repo/lib'
import { context } from '#main.tsx'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

type Args = { entry: DBStores['Page'] }

export function usePagePublish() {
  const mutation = useMutation({
    mutationKey: ['page', 'publish'],
    mutationFn: async (args: Args) => {
      // const resolvedPage = await resolveTree('pages', args.entry.id)
      // const data: Resolved['Page'] = { ...resolvedPage, publishedAt: new Date(), status: 'Published' }

      // Send data as payload to CICD
      // console.log(data)

      // TODO: When data comes back from CICD we update our db
      return context.update({
        entry: { ...args.entry, status: 'Published', publishedAt: new Date() },
      })
    },
    onSuccess: async () => {
      context.queryClient.invalidateQueries({ queryKey: ['pages'] })
    },
  })

  async function pagePublish(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, { loading: 'Publishing page...', success: 'Published page', error: 'Publishing page failed' })
    return promise
  }

  return { pagePublish }
}
