import { createFileRoute, Link } from '@tanstack/react-router'
import {
  useSuspenseQuery,
  useMutation,
  queryOptions,
} from '@tanstack/react-query'
import { type Context } from '../main'

// Route
export const Route = createFileRoute('/experiences/')({
  component: Experiences,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(queryOpts(context.getExperiences)),
  pendingComponent: () => <p>Loading..</p>,
  errorComponent: () => <p>Error!</p>,
})

// Route Component
export function Experiences() {
  const context = Route.useRouteContext()
  const navigate = Route.useNavigate()
  const { data: experiences, isRefetching } = useSuspenseQuery(
    queryOpts(context.getExperiences),
  )

  const addExperience = useMutation({
    mutationFn: context.addExperience,
    onSuccess: (experienceId) => {
      context.queryClient.invalidateQueries({ queryKey: ['experiences'] })
      navigate({ to: `/experiences/${experienceId}` })
    },
  })

  const deleteExperience = useMutation({
    mutationFn: context.deleteExperience,
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
            name: formData.get('name') as string,
            slug: formData.get('slug') as string,
          })
          form.reset()
        }}
      >
        <fieldset disabled={addExperience.isPending}>
          <input required name="name" placeholder="Name" type="text" />
          <input required name="slug" placeholder="Slug" type="text" />
          <button>Add</button>
        </fieldset>
      </form>

      {addExperience.isError && <p>{addExperience.error.message}</p>}
      {experiences.length === 0 && <h3>No experiences</h3>}

      <ul>
        {experiences.map((experience) => (
          <li key={experience.id}>
            <h4>{experience.name}</h4>
            <h5>{experience.slug}</h5>
            <p>
              <Link
                disabled={deleteExperience.isPending}
                params={{ id: String(experience.id) }}
                to="/experiences/$id"
              >
                Edit
              </Link>
            </p>
            <button
              disabled={deleteExperience.isPending}
              onClick={() => deleteExperience.mutate(experience?.id)}
            >
              delete
            </button>
            {deleteExperience.isError && (
              <p>{deleteExperience.error.message}</p>
            )}
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

function queryOpts(getExperiences: Context['getExperiences']) {
  return queryOptions({
    queryKey: ['experiences'],
    queryFn: () => getExperiences({ sortBy: 'latest' }),
  })
}
