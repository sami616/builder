import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { Template } from '../db'

export function useTemplateUpdateName() {
  const context = useRouteContext({ from: '/experiences/$id' })

  return useMutation({
    mutationFn: async (args: { template: Template; name: string }) => {
      const clonedEntry = structuredClone(args.template)
      clonedEntry.name = args.name
      return context.update({ entry: clonedEntry })
    },
    onSuccess: () => {
      context.queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}
