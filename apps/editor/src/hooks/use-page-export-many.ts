import { DBStores } from '@repo/lib'
import { context } from '#main.tsx'
import { useMutation } from '@tanstack/react-query'
import JSZip from 'jszip'
import { toast } from 'sonner'

type Args = { pages: Array<DBStores['Page']> }
export function usePageExportMany() {
  const mutation = useMutation({
    mutationKey: ['page', 'export'],
    mutationFn: async (args: Args) => {
      if (!('showSaveFilePicker' in window)) throw new Error('Save File API not supported')

      const zip = new JSZip()

      for (const page of args.pages) {
        const tree = await context.getTree({ root: { store: 'pages', id: page.id } })
        zip.file(`${page.title}.json`, JSON.stringify(tree, null, 2)) // Add JSON file to the zip
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
  })

  async function pageExportMany(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, { loading: 'Exporting pages...', success: 'Exported pages', error: 'Exporting pages failed' })
    return promise
  }

  return { pageExportMany }
}
