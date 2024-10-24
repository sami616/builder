import { useMutation } from '@tanstack/react-query'
import { Block } from '@/db'
import { useRouteContext } from '@tanstack/react-router'
import { toast } from 'sonner'

type Args = { block: Block; props: Block['props'] }

export function useBlockUpdateProps(id: Block['id']) {
  const context = useRouteContext({ from: '/pages/$id' })
  const mutation = useMutation({
    mutationKey: ['canvas', 'block', 'update', 'props', id],
    mutationFn: async (args: Args) => {
      const clonedEntry = structuredClone(args.block)
      clonedEntry.props = { ...clonedEntry.props, ...args.props }
      return context.update({ entry: clonedEntry })
    },
    onError: () => {
      toast.error('Updating props failed')
    },
    onSuccess: (id) => {
      context.queryClient.invalidateQueries({ queryKey: ['blocks', id] })
    },
  })

  async function blockUpdateProps(args: Args) {
    const promise = mutation.mutateAsync(args)
    // toast.promise(promise, { loading: 'Updating props...', success: 'Updated props', error: 'Updating props failed' })
    return promise
  }

  const blockOptimisic = mutation.isPending
    ? {
        ...mutation.variables?.block,
        props: {
          ...mutation.variables?.block.props,
          ...mutation.variables?.props,
        },
      }
    : undefined

  return { blockUpdateProps, blockOptimisic }
}
