import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { useRouteContext } from '@tanstack/react-router'
import { Template } from '@/db'

export function useTemplateUpdateName() {
  const context = useRouteContext({ from: '/pages/$id' })
  const { toast } = useToast()

  return {
    templateUpdateName: useMutation({
      mutationKey: ['canvas', 'template', 'update', 'name'],
      mutationFn: async (args: { template: Template; name: string }) => {
        const clonedEntry = structuredClone(args.template)
        clonedEntry.name = args.name
        return context.update({ entry: clonedEntry })
      },
      onSuccess: () => {
        context.queryClient.invalidateQueries({ queryKey: ['templates'] })
        toast({ description: 'Template updated' })
      },
      onError: (e) => {
        toast({ title: 'Template update failed', variant: 'destructive', description: e?.message })
      },
    }),
  }
}
