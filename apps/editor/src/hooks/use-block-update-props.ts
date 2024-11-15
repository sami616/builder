import { useMutation } from '@tanstack/react-query'
import { Block } from '@/db'
import { useRouteContext } from '@tanstack/react-router'
import { toast } from 'sonner'

type Args = { block: Block; props: Block['props'] }

export function useBlockUpdateProps() {
  const context = useRouteContext({ from: '/pages/$id' })
  const mutation = useMutation({
    mutationKey: ['canvas', 'block', 'update', 'props'],
    mutationFn: async (args: Args) => {
      const clonedEntry = structuredClone(args.block)
      clonedEntry.props = { ...clonedEntry.props, ...args.props }
      return context.update({ entry: clonedEntry })
    },
    onSuccess: (id) => {
      context.queryClient.invalidateQueries({ queryKey: ['blocks', id] })
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
