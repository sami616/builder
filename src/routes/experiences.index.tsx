import { createFileRoute, Link } from '@tanstack/react-router'
import { usePageAdd } from '../utils/usePageAdd'
import { usePageExport } from '../utils/usePageExport'
import { usePageExportMany } from '../utils/usePageExportMany'
import { usePageImport } from '../utils/usePageImport'
import { usePageCopy } from '../utils/usePageCopy'
import { usePageDelete } from '../utils/usePageDelete'
import { pageGetManyOpts, usePageGetMany } from '../utils/usePageGetMany'

// Route
export const Route = createFileRoute('/experiences/')({
  component: Experiences,
  loader: ({ context }) => context.queryClient.ensureQueryData(pageGetManyOpts({ context })),
  pendingComponent: () => <p>Loading..</p>,
  errorComponent: () => <p>Error!</p>,
})

// Route Component
export function Experiences() {
  const navigate = Route.useNavigate()
  const { data: experiences, isRefetching } = usePageGetMany()
  const pageAdd = usePageAdd()
  const pageExport = usePageExport()
  const pageExportMany = usePageExportMany()
  const pageImport = usePageImport()
  const pageCopy = usePageCopy()
  const pageDelete = usePageDelete()

  return (
    <>
      {isRefetching && <p>Refetching...</p>}
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const form = e.currentTarget
          const formData = new FormData(form)
          const id = await pageAdd.mutateAsync({
            entry: { 
              store: 'experiences',
              name: formData.get('name') as string,
              createdAt: new Date(),
              updatedAt: new Date(),
              slots: { root: [] },
              status: 'draft'
            },
          })
          form.reset()

          navigate({ to: `/experiences/${id}` })
        }}
      >
        <fieldset disabled={pageAdd.isPending}>
          <input required name="name" placeholder="Name" type="text" />
          <button>Add</button>
        </fieldset>
      </form>

      {pageAdd.isError && <p>{pageAdd.error.message}</p>}
      {experiences.length === 0 && <h3>No experiences</h3>}

      <button disabled={pageImport.isPending} onClick={() => pageImport.mutate()}>
        Import
      </button>
      <button disabled={pageExportMany.isPending} onClick={() => pageExportMany.mutate({ experiences })}>
        Export all
      </button>
      <ul>
        {experiences.map((experience) => (
          <li key={experience.id}>
            <input value={experience.id} type="checkbox" />
            <h4>{experience.name}</h4>
            <p>
              <Link disabled={pageDelete.isPending} params={{ id: String(experience.id) }} to="/experiences/$id">
                Edit
              </Link>
            </p>
            <button disabled={pageDelete.isPending} onClick={() => pageDelete.mutate({ entry: experience })}>
              Delete
            </button>
            <button disabled={pageCopy.isPending} onClick={() => pageCopy.mutate({ root: { store: 'experiences', id: experience.id } })}>
              Duplicate
            </button>
            <button disabled={pageExport.isPending} onClick={() => pageExport.mutate({ experience })}>
              Export
            </button>
            {pageDelete.isError && <p>{pageDelete.error.message}</p>}
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
