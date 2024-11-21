import { DBStores } from '@repo/lib'
import { context } from '#main.tsx'
import { useMutation } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { toast } from 'sonner'

type Args = { block: DBStores['Block']; props: DBStores['Block']['props'] }

export function useBlockUpdateProps() {
  const params = useParams({ strict: false })
  const mutation = useMutation({
    mutationKey: ['canvas', 'block', 'update', 'props'],
    mutationFn: async (args: Args) => {
      const date = new Date()
      const clonedEntry = structuredClone(args.block)
      clonedEntry.props = { ...clonedEntry.props, ...args.props }
      clonedEntry.updatedAt = date

      if (params.id) {
        const page = context.queryClient.getQueryData<DBStores['Page']>(['pages', Number(params.id)])
        if (page) await context.update({ entry: { ...page, updatedAt: date } })
      }

      return context.update({ entry: clonedEntry })
    },
    onSuccess: (id) => {
      context.queryClient.invalidateQueries({ queryKey: ['blocks', id] })
      context.queryClient.invalidateQueries({ queryKey: ['pages'] })
    },
  })

  async function blockUpdateProps(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, {
      loading: `Updating ${args.block.name}`,
      success: `Updated ${args.block.name}`,
      error: `Updating ${args.block.name} failed`,
    })
    return promise
  }

  return { blockUpdateProps }
}
