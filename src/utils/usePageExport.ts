import { useMutation } from '@tanstack/react-query'
import { Experience } from '../db'
import { useRouteContext } from '@tanstack/react-router'

export function usePageExport() {
  const context = useRouteContext({ from: '/experiences/' })
  return useMutation({
    mutationFn: async (args: { experience: Experience }) => {
      if (!('showSaveFilePicker' in window)) throw new Error('Save File API not supported')
      // @ts-ignore: no types for this api yet :(
      const handle = await window.showSaveFilePicker({
        types: [{ description: 'JSON File', accept: { 'application/json': ['.json'] } }],
        suggestedName: `${args.experience.name}.json`,
      })
      const writableStream = await handle.createWritable()
      const tree = await context.getTree({ root: { store: 'experiences', id: args.experience.id } })
      await writableStream.write(JSON.stringify(tree, null, 2))
      await writableStream.close()
      return tree
    },
  })
}
