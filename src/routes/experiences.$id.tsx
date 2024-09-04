import { createFileRoute } from '@tanstack/react-router'
import {
  useSuspenseQuery,
  queryOptions,
  useMutation,
} from '@tanstack/react-query'
import { type Context } from '../main'
import { type Experience, type Block } from '../db'
import { Canvas } from '../editor-components/Canvas'
import { Suspense, useState } from 'react'
import { ComponentPanel } from '../editor-components/ComponentPanel'
import './experiences.$id.css'
import { PropsPanel } from '../editor-components/PropsPanel'
import { useDnDEvents } from '../utils/useDnDEvents'
import { LayerPanel } from '../editor-components/LayerPanel'

export const Route = createFileRoute('/experiences/$id')({
  component: Experience,
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(
      // Todo: how can i start to prefetch all the blocks assosiated with this experience?
      queryOpts(Number(params.id), context.getExperience),
    ),
  pendingComponent: () => <p>Loading..</p>,
  errorComponent: () => <p>Error!</p>,
})

function Experience() {
  const { id } = Route.useParams()
  const context = Route.useRouteContext()

  const [activeBlockId, setActiveBlockId] = useState<Block['id'] | undefined>()

  const { data: experience } = useSuspenseQuery(
    queryOpts(Number(id), context.getExperience),
  )

  const updateExperienceMeta = useMutation({
    mutationFn: (args: { name: string; slug: string }) => {
      const clonedExperience = structuredClone(experience)
      clonedExperience.name = args.name
      clonedExperience.slug = args.slug
      return context.updateExperience({ experience: clonedExperience })
    },
    onSuccess: () => {
      context.queryClient.invalidateQueries({
        queryKey: ['experiences', experience.id],
      })
    },
  })

  const { pending } = useDnDEvents()

  return (
    <div data-component="experiences.$id">
      {/* Edit experience meta data */}
      <div>
        <p>{experience.name}</p>
        <p>{experience.slug}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.currentTarget
            const formData = new FormData(form)
            updateExperienceMeta.mutate({
              name: formData.get('name') as string,
              slug: formData.get('slug') as string,
            })
          }}
        >
          <fieldset disabled={updateExperienceMeta.isPending}>
            <input type="text" name="name" defaultValue={experience.name} />
            <input name="slug" type="text" defaultValue={experience.slug} />
            <button type="submit">Update</button>
          </fieldset>
        </form>
      </div>
      {updateExperienceMeta.isPending && <p>Updating...</p>}
      {updateExperienceMeta.error && (
        <p>{updateExperienceMeta.error.message}</p>
      )}

      <Suspense fallback={<p>Loading...</p>}>
        <main>
          <aside>
            <details open name="components">
              <summary>Components</summary>
              <ComponentPanel
                isCanvasUpdatePending={pending}
                experience={experience}
              />
            </details>
            <details open name="layers">
              <summary>Layers</summary>
              <LayerPanel
                isCanvasUpdatePending={pending}
                experience={experience}
              />
            </details>
          </aside>

          <Canvas
            activeBlockId={activeBlockId}
            setActiveBlockId={setActiveBlockId}
            isCanvasUpdatePending={pending}
            experience={experience}
          />

          {activeBlockId !== undefined && (
            <aside>
              <PropsPanel
                activeBlockId={activeBlockId}
                setActiveBlockId={setActiveBlockId}
              />
            </aside>
          )}
        </main>
      </Suspense>
    </div>
  )
}

function queryOpts(id: number, getExperience: Context['getExperience']) {
  return queryOptions({
    queryKey: ['experiences', id],
    queryFn: () => getExperience({ experienceId: id }),
  })
}
