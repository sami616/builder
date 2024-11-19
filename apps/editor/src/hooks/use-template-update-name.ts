import { useMutation } from '@tanstack/react-query'
import { Template } from '#db.ts'
import { toast } from 'sonner'
import { context } from '#main.tsx'

type Args = { template: Template; name: string }

export function useTemplateUpdateName() {
  const mutation = useMutation({
    mutationKey: ['canvas', 'template', 'update', 'name'],
    mutationFn: async (args: Args) => {
      const clonedEntry = structuredClone(args.template)
      clonedEntry.name = args.name
      return context.update({ entry: clonedEntry })
    },
    onSuccess: () => {
      context.queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })

  async function templateUpdateName(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, { loading: 'Updating template...', success: 'Updated template', error: 'Updating template failed' })
    return promise
  }
  return { templateUpdateName }
}
