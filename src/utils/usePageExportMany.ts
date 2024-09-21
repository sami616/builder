import { useMutation } from '@tanstack/react-query'
import JSZip from 'jszip'
import { type Experience } from '../db'
import { useRouteContext } from '@tanstack/react-router'

export function usePageExportMany() {
  const context = useRouteContext({ from: '/experiences/' })
  return {
    pageExportMany: useMutation({
      mutationKey: ['page', 'export'],
      mutationFn: async (args: { experiences: Array<Experience> }) => {
        if (!('showSaveFilePicker' in window)) throw new Error('Save File API not supported')

        const zip = new JSZip()

        for (const experience of args.experiences) {
          const tree = await context.getTree({ root: { store: 'experiences', id: experience.id } })
          zip.file(`${experience.name}.json`, JSON.stringify(tree, null, 2)) // Add JSON file to the zip
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' })

        // @ts-ignore: no types for this api yet :(
        const handle = await window.showSaveFilePicker({
          types: [{ description: 'JSON Files', accept: { 'application/zip': ['.zip'] } }],
          suggestedName: 'experiences.zip',
        })

        const writableStream = await handle.createWritable()
        await writableStream.write(zipBlob)
        await writableStream.close()
      },
    }),
  }
}
