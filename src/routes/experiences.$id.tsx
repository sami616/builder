import { createFileRoute } from '@tanstack/react-router'
import {
  useSuspenseQuery,
  queryOptions,
  useMutation,
} from '@tanstack/react-query'
import { isBlockItemSource } from '../components/BlockItem'
import * as blocks from '../blocks'
import { type Context } from '../main'
import { type Experience } from '../db'
import { Canvas, isCanvasTarget } from '../components/Canvas'
import { useEffect, useState } from 'react'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import {
  Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge'
import {
  isCanvasItemSource,
  isCanvasItemTarget,
} from '../components/CanvasItem'
import { BlockList } from '../components/BlockList'
import './experiences.$id.css'
import { Blocks, generateUniqueId } from '../utils'

export const Route = createFileRoute('/experiences/$id')({
  component: Experience,
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(
      queryOpts(params.id, context.getExperience),
    ),
  pendingComponent: () => <p>Loading..</p>,
  errorComponent: () => <p>Error!</p>,
})

function Experience() {
  const { id } = Route.useParams()
  const context = Route.useRouteContext()

  const [activeBlockId, setActiveBlockId] = useState<string | undefined>()

  const { data: experience } = useSuspenseQuery(
    queryOpts(id, context.getExperience),
  )

  const updateExperienceBlockProps = useMutation({
    mutationFn: context.updateExperience,
    onMutate: async ({ experience: newExperience }) => {
      await context.queryClient.cancelQueries({
        queryKey: ['experiences', String(newExperience.id)],
      })

      const previousExperience = context.queryClient.getQueryData<Experience>([
        'experiences',
        String(newExperience.id),
      ])

      context.queryClient.setQueryData(
        ['experiences', String(newExperience.id)],
        newExperience,
      )

      return { newExperience, previousExperience }
    },
    onError: (error, _newExperience, errContext) => {
      context.queryClient.setQueryData(
        ['experiences', String(errContext?.newExperience.id)],
        errContext?.previousExperience,
      )
      // Todo notify user via toast or something similar
      console.log(error)
    },
    onSettled: (newExperienceId) => {
      context.queryClient.invalidateQueries({
        queryKey: ['experiences', String(newExperienceId)],
      })
    },
  })

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

  const addExperienceBlock = useMutation({
    mutationFn: (args: {
      type: Blocks
      index?: number
      edge?: Edge | null
    }) => {
      const clonedExperience = structuredClone(experience)
      const newBlock = {
        id: generateUniqueId(),
        type: args.type,
        props: blocks[args.type].initialProps,
      }
      if (args.index === undefined) {
        clonedExperience.blocks.push(newBlock)
      } else {
        const atIndex = args.edge === 'top' ? args.index : args.index + 1
        clonedExperience.blocks.splice(atIndex, 0, newBlock)
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
          if (isBlockItemSource(source.data)) {
            addExperienceBlock.mutate({ type: source.data.type })
          }
        }

        if (isCanvasItemTarget(target.data)) {
          const closestEdge = extractClosestEdge(target.data)
          if (isBlockItemSource(source.data)) {
            addExperienceBlock.mutate({
              type: source.data.type,
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
    moveExperienceBlock.isPending || addExperienceBlock.isPending

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

      <main>
        <aside>
          <BlockList
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

        {activeBlockId && (
          <aside>
            <button onClick={() => setActiveBlockId(undefined)}>❌</button>
            <input
              type="text"
              value={
                experience.blocks.find((block) => block.id === activeBlockId)
                  ?.props?.children
              }
              // Prop panel - i think i need to use optimistic updates or debouncing here incase indexdb is slow this will feel very sluggish
              onChange={(e) => {
                const clonedExperience = structuredClone(experience)
                const editedBlock = clonedExperience.blocks.find(
                  (block) => block.id === activeBlockId,
                )
                if (!editedBlock) return
                editedBlock.props.children = e.target.value
                updateExperienceBlockProps.mutate({
                  experience: clonedExperience,
                })
              }}
            />
          </aside>
        )}
      </main>
    </div>
  )
}

function queryOpts(id: string, getExperience: Context['getExperience']) {
  return queryOptions({
    queryKey: ['experiences', id],
    queryFn: () => getExperience({ experienceId: Number(id) }),
  })
}
