import { type Page } from '#db.ts'
import { context } from '#main.tsx'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

type Args = { entry: Page }

export function usePageUnpublish() {
  const mutation = useMutation({
    mutationKey: ['page', 'unpublish'],
    mutationFn: async (args: Args) => {
      // const data = { ...args.entry, slots: {}, status: 'Unpublished' }

      // Send data as payload to CICD
      // console.log(data)

      // TODO: When data comes back from CICD we update our db
      return context.update({
        entry: { ...args.entry, status: 'Unpublished' },
      })
    },
    onSuccess: async () => {
      context.queryClient.invalidateQueries({ queryKey: ['pages'] })
    },
  })

  async function pageUnpublish(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, { loading: 'Unpublishing page...', success: 'Unpublished page', error: 'Unpublishing page failed' })
    return promise
  }

  return { pageUnpublish }
}
