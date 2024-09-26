import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { Page } from '../db'
import { useRouteContext } from '@tanstack/react-router'

export function usePageExport() {
  const context = useRouteContext({ from: '/pages/' })
  const { toast } = useToast()
  return {
    pageExport: useMutation({
      mutationKey: ['page', 'export'],
      mutationFn: async (args: { page: Page }) => {
        if (!('showSaveFilePicker' in window)) throw new Error('Save File API not supported')
        // @ts-ignore: no types for this api yet :(
        const handle = await window.showSaveFilePicker({
          types: [{ description: 'JSON File', accept: { 'application/json': ['.json'] } }],
          suggestedName: `${args.page.name}.json`,
        })
        const writableStream = await handle.createWritable()
        const tree = await context.getTree({ root: { store: 'pages', id: args.page.id } })
        await writableStream.write(JSON.stringify(tree, null, 2))
        await writableStream.close()
        return tree
      },
      onSuccess: async () => {
        toast({ description: 'Page exported' })
      },
      onError: (e) => {
        toast({ title: 'Page exporting failed', variant: 'destructive', description: e?.message })
      },
    }),
  }
}
