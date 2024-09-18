import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { Experience } from '../db'

export function usePageUpdateName() {
  const context = useRouteContext({ from: '/experiences/$id' })

  return useMutation({
    mutationFn: (args: { experience: Experience; name: string }) => {
      const clonedEntry = structuredClone(args.experience)
      clonedEntry.name = args.name
      return context.update({ entry: clonedEntry })
    },
    onSuccess: (id) => {
      context.queryClient.invalidateQueries({
        queryKey: ['experiences', id],
      })
    },
  })
}
