import { useMutation } from '@tanstack/react-query'
import JSZip from 'jszip'
import { type Page } from '../db'
import { useRouteContext } from '@tanstack/react-router'
import { useToast } from '@/hooks/use-toast'

export function usePageExportMany() {
  const context = useRouteContext({ from: '/pages/' })
  const { toast } = useToast()
  return {
    pageExportMany: useMutation({
      mutationKey: ['page', 'export'],
      mutationFn: async (args: { pages: Array<Page> }) => {
        if (!('showSaveFilePicker' in window)) throw new Error('Save File API not supported')

        const zip = new JSZip()

        for (const page of args.pages) {
          const tree = await context.getTree({ root: { store: 'pages', id: page.id } })
          zip.file(`${page.name}.json`, JSON.stringify(tree, null, 2)) // Add JSON file to the zip
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' })

        // @ts-ignore: no types for this api yet :(
        const handle = await window.showSaveFilePicker({
          types: [{ description: 'JSON Files', accept: { 'application/zip': ['.zip'] } }],
          suggestedName: 'pages.zip',
        })

        const writableStream = await handle.createWritable()
        await writableStream.write(zipBlob)
        await writableStream.close()
      },
      onSuccess: async () => {
        toast({ description: 'Pages exported' })
      },
      onError: (e) => {
        toast({ title: 'Pages exporting failed', variant: 'destructive', description: e?.message })
      },
    }),
  }
}
