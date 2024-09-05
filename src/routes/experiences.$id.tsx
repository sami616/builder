import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery, queryOptions, useMutation } from '@tanstack/react-query'
import { type Context } from '../main'
import { type Experience, type Block } from '../db'
import { Suspense, useState } from 'react'
import { ComponentPanel } from '../editor-components/ComponentPanel'
import './experiences.$id.css'
import { PropsPanel } from '../editor-components/PropsPanel'
import { useDnDEvents } from '../utils/useDnDEvents'
import { LayerPanel } from '../editor-components/LayerPanel'
import { DropZone } from '../editor-components/DropZone'
import { experienceBlocksKey } from '../api'
import { BlockItem } from '../editor-components/BlockItem'

export const Route = createFileRoute('/experiences/$id')({
  component: Experience,
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(
      // Todo: how can i start to prefetch all the blocks assosiated with this experience?
      queryOpts(Number(params.id), context.get),
    ),
  pendingComponent: () => <p>Loading..</p>,
  errorComponent: () => <p>Error!</p>,
})

function Experience() {
  const { id } = Route.useParams()
  const context = Route.useRouteContext()

  const [activeBlockId, setActiveBlockId] = useState<Block['id'] | undefined>()

  const { data: experience } = useSuspenseQuery(queryOpts(Number(id), context.get))

  const blocks = Object.values(experience.slots)[0]

  const updateExperienceMeta = useMutation({
    mutationFn: (args: { experience: Experience; name: string }) => {
      const clonedEntry = structuredClone(args.experience)
      clonedEntry.name = args.name
      return context.update({ entry: clonedEntry })
    },
    onSuccess: (id) => {
      context.queryClient.invalidateQueries({
        queryKey: ['experiences', id],
      })
    },
  })

  const { pending } = useDnDEvents()

  return (
    <div data-component="experiences.$id">
      {/* Edit experience meta data */}
      <div>
        <p>{experience.name}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.currentTarget
            const formData = new FormData(form)
            updateExperienceMeta.mutate({ experience, name: formData.get('name') as string })
          }}
        >
          <fieldset disabled={updateExperienceMeta.isPending}>
            <input type="text" name="name" defaultValue={experience.name} />
            <button type="submit">Update</button>
          </fieldset>
        </form>
      </div>
      {updateExperienceMeta.isPending && <p>Updating...</p>}
      {updateExperienceMeta.error && <p>{updateExperienceMeta.error.message}</p>}

      <Suspense fallback={<p>Loading...</p>}>
        <main>
          <aside>
            <details open name="components">
              <summary>Components</summary>
              <ComponentPanel isCanvasUpdatePending={pending} experience={experience} />
            </details>
            <details open name="layers">
              <summary>Layers</summary>
              <LayerPanel isCanvasUpdatePending={pending} experience={experience} />
            </details>
          </aside>

          <div>
            {blocks.length === 0 && (
              <DropZone
                label="Root"
                parent={{
                  slot: experienceBlocksKey,
                  node: experience,
                }}
              />
            )}
            {blocks.map((blockId, index) => {
              return (
                <BlockItem
                  blockId={blockId}
                  parent={{
                    node: experience,
                    slot: experienceBlocksKey,
                  }}
                  index={index}
                  experience={experience}
                  activeBlockId={activeBlockId}
                  setActiveBlockId={setActiveBlockId}
                  isCanvasUpdatePending={pending}
                  key={blockId}
                />
              )
            })}
          </div>

          {activeBlockId !== undefined && (
            <aside>
              <PropsPanel activeBlockId={activeBlockId} setActiveBlockId={setActiveBlockId} />
            </aside>
          )}
        </main>
      </Suspense>
    </div>
  )
}

function queryOpts(id: number, get: Context['get']) {
  return queryOptions({
    queryKey: ['experiences', id],
    queryFn: () => get({ id, type: 'experiences' }),
  })
}
