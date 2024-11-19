import { useMutation } from '@tanstack/react-query'
import { Block, Page } from '#db.ts'
import { useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import { context } from '#main.tsx'

type Args = { block: Block; name: string }

export function useBlockUpdateName() {
  const params = useParams({ strict: false })
  const mutation = useMutation({
    mutationKey: ['canvas', 'block', 'update', 'name'],
    mutationFn: async (args: Args) => {
      const date = new Date()
      const clonedEntry = structuredClone(args.block)
      clonedEntry.name = args.name
      clonedEntry.updatedAt = date

      if (params.id) {
        const page = context.queryClient.getQueryData<Page>(['pages', Number(params.id)])
        if (page) await context.update({ entry: { ...page, updatedAt: date } })
      }

      return context.update({ entry: clonedEntry })
    },
    onSuccess: (id) => {
      context.queryClient.invalidateQueries({ queryKey: ['blocks', id] })
      context.queryClient.invalidateQueries({ queryKey: ['pages'] })
    },
  })

  async function blockUpdateName(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, { loading: 'Updating layer...', success: 'Updated layer', error: 'Updating layer failed' })
    return promise
  }

  return { blockUpdateName }
}
