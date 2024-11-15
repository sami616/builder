import { useMutation } from '@tanstack/react-query'
import { Block } from '@/db'
import { useRouteContext } from '@tanstack/react-router'
import { toast } from 'sonner'

type Args = { block: Block; name: string }

export function useBlockUpdateName() {
  const context = useRouteContext({ from: '/pages/$id' })
  const mutation = useMutation({
    mutationKey: ['canvas', 'block', 'update', 'name'],
    mutationFn: async (args: Args) => {
      const clonedEntry = structuredClone(args.block)
      clonedEntry.name = args.name
      return context.update({ entry: clonedEntry })
    },
    onSuccess: (id) => {
      context.queryClient.invalidateQueries({ queryKey: ['blocks', id] })
    },
  })

  async function blockUpdateName(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, { loading: 'Updating layer...', success: 'Updated layer', error: 'Updating layer failed' })
    return promise
  }

  return { blockUpdateName }
}
