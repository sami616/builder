import { useMutation } from '@tanstack/react-query'
import { Page } from '#db.ts'
import { toast } from 'sonner'
import { context } from '#main.tsx'

type Args = { page: Page }

export function usePageExport() {
  const mutation = useMutation({
    mutationKey: ['page', 'export'],
    mutationFn: async (args: Args) => {
      if (!('showSaveFilePicker' in window)) throw new Error('Save File API not supported')
      // @ts-ignore: no types for this api yet :(
      const handle = await window.showSaveFilePicker({
        types: [{ description: 'JSON File', accept: { 'application/json': ['.json'] } }],
        suggestedName: `${args.page.title}.json`,
      })
      const writableStream = await handle.createWritable()
      const tree = await context.getTree({ root: { store: 'pages', id: args.page.id } })
      await writableStream.write(JSON.stringify(tree, null, 2))
      await writableStream.close()
      return tree
    },
  })

  async function pageExport(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, { loading: 'Exporting page...', success: 'Exported page', error: 'Exporting page failed' })
    return promise
  }

  return { pageExport }
}
