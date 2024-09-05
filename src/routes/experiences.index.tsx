import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery, useMutation, queryOptions } from '@tanstack/react-query'
import { experienceBlocksKey } from '../api'
import { type Block, type Experience } from '../db'
import { type Context } from '../main'

// Route
export const Route = createFileRoute('/experiences/')({
  component: Experiences,
  loader: ({ context }) => context.queryClient.ensureQueryData(queryOpts(context.getMany)),
  pendingComponent: () => <p>Loading..</p>,
  errorComponent: () => <p>Error!</p>,
})

// Route Component
export function Experiences() {
  const context = Route.useRouteContext()
  const navigate = Route.useNavigate()
  const { data: experiences, isRefetching } = useSuspenseQuery(queryOpts(context.getMany))

  const addExperience = useMutation({
    mutationFn: context.add,
    onSuccess: (id) => {
      context.queryClient.invalidateQueries({ queryKey: ['experiences'] })
      navigate({ to: `/experiences/${id}` })
    },
  })

  const exportExperience = useMutation({
    mutationFn: async (args: { experience: Experience }) => {
      if (!('showSaveFilePicker' in window)) throw new Error('Save File API not supported')
      // @ts-ignore: no types for this api yet :(
      const handle = await window.showSaveFilePicker({
        types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
        suggestedName: `${args.experience.name}.json`,
      })
      const writableStream = await handle.createWritable()
      const entries = await context.getTree({ root: { type: 'experience', id: args.experience.id } })
      await writableStream.write(JSON.stringify(entries, null, 2))
      await writableStream.close()
      return entries
    },
  })

  const importExperience = useMutation({
    mutationFn: async () => {
      if (!('showSaveFilePicker' in window)) throw new Error('Save File API not supported')

      // @ts-ignore: no types for this api yet :(
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
      })

      const file = await handle.getFile()
      // Todo, runtime check with zod?
      const entries = JSON.parse(file.text()) as ImportExportData
      const idMap = new Map()
      let newRootId = null

      for (const entry of entries) {
        const clonedEntry = structuredClone(entry)
        for (var slot in entry.slots) {
          clonedEntry.slots[slot] = entry.slots[slot].map((id) => idMap.get(id))
        }

        const date = new Date()
        clonedEntry.createdAt = date
        clonedEntry.updatedAt = date
        const { id, ...clonedEntryWithoutId } = clonedEntry
        newRootId = await context.add({ entry: clonedEntryWithoutId })
        idMap.set(entry.id, newRootId)
      }
    },
    onSuccess: () => {
      context.queryClient.invalidateQueries({ queryKey: ['experiences'] })
    },
  })

  const removeExperience = useMutation({
    mutationFn: async (args: { entry: Experience }) => {
      const entries = await context.getTree({ root: { type: 'experience', id: args.entry.id }, entries: [] })
      await context.removeMany({ entries })
    },
    onSuccess: () => {
      context.queryClient.invalidateQueries({ queryKey: ['experiences'] })
    },
  })

  return (
    <>
      {isRefetching && <p>Refetching...</p>}
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const form = e.currentTarget
          const formData = new FormData(form)
          await addExperience.mutateAsync({
            entry: {
              name: formData.get('name') as string,
              createdAt: new Date(),
              updatedAt: new Date(),
              slots: { [experienceBlocksKey]: [] },
              status: 'draft',
            },
          })
          form.reset()
        }}
      >
        <fieldset disabled={addExperience.isPending}>
          <input required name="name" placeholder="Name" type="text" />
          <button>Add</button>
        </fieldset>
      </form>

      {addExperience.isError && <p>{addExperience.error.message}</p>}
      {experiences.length === 0 && <h3>No experiences</h3>}

      <button disabled={importExperience.isPending} onClick={() => importExperience.mutate()}>
        Import
      </button>
      <ul>
        {experiences.map((experience) => (
          <li key={experience.id}>
            <h4>{experience.name}</h4>
            <p>
              <Link disabled={removeExperience.isPending} params={{ id: String(experience.id) }} to="/experiences/$id">
                Edit
              </Link>
            </p>
            <button disabled={removeExperience.isPending} onClick={() => removeExperience.mutate({ entry: experience })}>
              Delete
            </button>
            <button disabled={exportExperience.isPending} onClick={() => exportExperience.mutate({ experience })}>
              Export
            </button>
            {removeExperience.isError && <p>{removeExperience.error.message}</p>}
            <p>{experience.status}</p>
            <p>
              <b>Created at</b>
              <time>{experience.createdAt.toLocaleString()}</time>
            </p>
            <p>
              <b>Updated at</b>
              <time>{experience.updatedAt.toLocaleString()}</time>
            </p>
          </li>
        ))}
      </ul>
    </>
  )
}

function queryOpts(getMany: Context['getMany']) {
  return queryOptions({
    queryKey: ['experiences'],
    queryFn: () => getMany({ type: 'experiences', sortBy: 'latest' }),
  })
}

type ImportExportData = Array<Block | Experience>
