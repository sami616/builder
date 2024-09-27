import { useToast } from '@/hooks/use-toast'
import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'

export function usePageImport() {
  const context = useRouteContext({ from: '/pages/' })
  const { toast } = useToast()
  return {
    pageImport: useMutation({
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
        toast({ description: 'Page imported' })
      },
      onError: (e) => {
        toast({ title: 'Page import failed', variant: 'destructive', description: e?.message })
      },
    }),
  }
}
