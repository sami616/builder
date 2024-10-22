import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { toast } from 'sonner'

export function usePageImport() {
  const context = useRouteContext({ from: '/pages/' })
  const mutation = useMutation({
    mutationKey: ['page', 'import'],
    mutationFn: async () => {
      if (!('showSaveFilePicker' in window)) throw new Error('Save File API not supported')

      // @ts-ignore: no types for this api yet :(
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
      })

      const file = await handle.getFile()

      // Todo, runtime check with zod?
      const tree = JSON.parse(await file.text()) as Awaited<ReturnType<typeof context.getTree>>

      await context.duplicateTree({ tree })
    },
    onSuccess: () => {
      context.queryClient.invalidateQueries({ queryKey: ['pages'] })
    },
  })

  async function pageImport() {
    const promise = mutation.mutateAsync()
    toast.promise(promise, { loading: 'Importing page...', success: 'Imported page', error: 'Importing page failed' })
    return promise
  }

  return { pageImport }
}
