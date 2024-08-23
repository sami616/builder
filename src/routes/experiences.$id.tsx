import { createFileRoute } from '@tanstack/react-router'
import {
  useSuspenseQuery,
  queryOptions,
  useMutation,
} from '@tanstack/react-query'
import { isComponentItemSource } from '../editor-components/ComponentItem'
import { type Context } from '../main'
import { type Experience } from '../db'
import { Canvas, isCanvasTarget } from '../editor-components//Canvas'
import { Suspense, useEffect, useState } from 'react'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import {
  Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge'
import {
  isCanvasItemSource,
  isCanvasItemTarget,
} from '../editor-components/CanvasItem'
import { ComponentPanel } from '../editor-components/ComponentPanel'
import './experiences.$id.css'
import { type Block } from '../db'
import { PropsPanel } from '../editor-components/PropsPanel'

export const Route = createFileRoute('/experiences/$id')({
  component: Experience,
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(
      // Todo: how can i start to prefetch all the blocks assosiated with this experience?
      queryOpts(params.id, context.getExperience),
    ),
  pendingComponent: () => <p>Loading..</p>,
  errorComponent: () => <p>Error!</p>,
})

function Experience() {
  const { id } = Route.useParams()
  const context = Route.useRouteContext()

  const [activeBlockId, setActiveBlockId] = useState<Block['id'] | undefined>()

  const { data: experience } = useSuspenseQuery(
    queryOpts(id, context.getExperience),
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
        queryKey: ['experiences', String(experience.id)],
      })
    },
  })

  const moveExperienceBlock = useMutation({
    mutationFn: (args: {
      sourceIndex: number
      targetIndex: number
      edge: Edge | null
    }) => {
      const clonedExperience = structuredClone(experience)
      clonedExperience.blocks = reorderWithEdge({
        list: experience.blocks,
        startIndex: args.sourceIndex,
        indexOfTarget: args.targetIndex,
        closestEdgeOfTarget: args.edge,
        axis: 'vertical',
      })
      return context.updateExperience({ experience: clonedExperience })
    },
    onSuccess: () => {
      context.queryClient.invalidateQueries({
        queryKey: ['experiences', String(experience.id)],
      })
    },
  })

  // Todo: this should do both the adding of the block and updating the exerience in one promise / promise.all
  const addBlock = useMutation({
    mutationFn: (args: { type: Block['type'] }) => {
      const configItem = context.config[args.type]

      const propKeys = Object.keys(configItem.props)
      const blockKeys = Object.keys(configItem.blocks)

      const initialProps = propKeys.reduce((acc, curr) => {
        return { ...acc, [curr]: configItem.props[curr].default }
      }, {})

      const initialBlocks = blockKeys.reduce((acc, curr) => {
        return { ...acc, [curr]: configItem.blocks[curr].default }
      }, {})

      return context.addBlock({
        type: args.type,
        name: configItem.name,
        props: initialProps,
        blocks: initialBlocks,
      })
    },

    onSuccess: () => {
      context.queryClient.invalidateQueries({
        queryKey: ['blocks', String(experience.id)],
      })
    },
  })

  const addBlockToExperience = useMutation({
    mutationFn: (args: {
      blockId: Block['id']
      index?: number
      edge?: Edge | null
    }) => {
      const clonedExperience = structuredClone(experience)
      if (args.index === undefined) {
        clonedExperience.blocks.push(args.blockId)
      } else {
        const atIndex = args.edge === 'top' ? args.index : args.index + 1
        clonedExperience.blocks.splice(atIndex, 0, args.blockId)
      }
      return context.updateExperience({ experience: clonedExperience })
    },
    onSuccess: () => {
      context.queryClient.invalidateQueries({
        queryKey: ['experiences', String(experience.id)],
      })
    },
  })

  useEffect(() => {
    return monitorForElements({
      onDrop: async ({ source, location }) => {
        const target = location.current.dropTargets[0]

        if (isCanvasTarget(target.data)) {
          if (isComponentItemSource(source.data)) {
            const blockId = await addBlock.mutateAsync({
              type: source.data.type,
            })
            addBlockToExperience.mutate({ blockId })
          }
        }

        if (isCanvasItemTarget(target.data)) {
          const closestEdge = extractClosestEdge(target.data)
          if (isComponentItemSource(source.data)) {
            const blockId = await addBlock.mutateAsync({
              type: source.data.type,
            })
            addBlockToExperience.mutate({
              blockId,
              index: target.data.index,
              edge: closestEdge,
            })
          }
          if (isCanvasItemSource(source.data)) {
            moveExperienceBlock.mutate({
              edge: closestEdge,
              targetIndex: target.data.index,
              sourceIndex: source.data.index,
            })
          }
        }
      },
    })
  }, [experience])

  const isCanvasUpdatePending =
    moveExperienceBlock.isPending || addBlock.isPending

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
            <ComponentPanel
              isCanvasUpdatePending={isCanvasUpdatePending}
              experience={experience}
            />
          </aside>

          <Canvas
            activeBlockId={activeBlockId}
            setActiveBlockId={setActiveBlockId}
            isCanvasUpdatePending={isCanvasUpdatePending}
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

function queryOpts(id: string, getExperience: Context['getExperience']) {
  return queryOptions({
    queryKey: ['experiences', id],
    queryFn: () => getExperience({ experienceId: Number(id) }),
  })
}
