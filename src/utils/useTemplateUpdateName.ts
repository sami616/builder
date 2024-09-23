import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { Template } from '../db'

export function useTemplateUpdateName() {
  const context = useRouteContext({ from: '/pages/$id' })

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
      },
    }),
  }
}
