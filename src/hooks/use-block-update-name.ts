import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { Block } from '@/db'
import { useRouteContext } from '@tanstack/react-router'

export function useBlockUpdateName() {
  const context = useRouteContext({ from: '/pages/$id' })
  const { toast } = useToast()
  return {
    blockUpdateName: useMutation({
      mutationKey: ['canvas', 'block', 'update', 'name'],
      mutationFn: async (args: { block: Block; name: string }) => {
        const clonedEntry = structuredClone(args.block)
        clonedEntry.name = args.name
        return context.update({ entry: clonedEntry })
      },
      onSuccess: (id) => {
        context.queryClient.invalidateQueries({ queryKey: ['blocks', id] })
        toast({ description: 'Layer updated' })
      },
      onError: (e) => {
        toast({ title: 'Layer update failed', variant: 'destructive', description: e?.message })
      },
    }),
  }
}
