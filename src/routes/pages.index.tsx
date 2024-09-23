import { createFileRoute, Link } from '@tanstack/react-router'
import { usePageAdd } from '../utils/usePageAdd'
import { usePageExport } from '../utils/usePageExport'
import { usePageExportMany } from '../utils/usePageExportMany'
import { usePageImport } from '../utils/usePageImport'
import { usePageCopy } from '../utils/usePageCopy'
import { usePageDelete } from '../utils/usePageDelete'
import { pageGetManyOpts, usePageGetMany } from '../utils/usePageGetMany'

// Route
export const Route = createFileRoute('/pages/')({
  component: Pages,
  loader: ({ context }) => context.queryClient.ensureQueryData(pageGetManyOpts({ context })),
  pendingComponent: () => <p>Loading..</p>,
  errorComponent: () => <p>Error!</p>,
})

// Route Component
export function Pages() {
  const navigate = Route.useNavigate()
  const { pageGetMany } = usePageGetMany()
  const { pageAdd } = usePageAdd()
  const { pageExport } = usePageExport()
  const { pageExportMany } = usePageExportMany()
  const { pageImport } = usePageImport()
  const { pageCopy } = usePageCopy()
  const { pageDelete } = usePageDelete()

  return (
    <>
      {pageGetMany.isRefetching && <p>Refetching...</p>}
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const form = e.currentTarget
          const formData = new FormData(form)
          const id = await pageAdd.mutateAsync({
            entry: {
              store: 'pages',
              name: formData.get('name') as string,
              createdAt: new Date(),
              updatedAt: new Date(),
              slots: { root: [] },
              status: 'draft',
            },
          })
          form.reset()

          navigate({ to: `/pages/${id}` })
        }}
      >
        <fieldset disabled={pageAdd.isPending}>
          <input required name="name" placeholder="Name" type="text" />
          <button>Add</button>
        </fieldset>
      </form>

      {pageAdd.isError && <p>{pageAdd.error.message}</p>}
      {pageGetMany.data.length === 0 && <h3>No pages</h3>}

      <button disabled={pageImport.isPending} onClick={() => pageImport.mutate()}>
        Import
      </button>
      <button disabled={pageExportMany.isPending} onClick={() => pageExportMany.mutate({ pages: pageGetMany.data })}>
        Export all
      </button>
      <ul>
        {pageGetMany.data.map((page) => (
          <li key={page.id}>
            <input value={page.id} type="checkbox" />
            <h4>{page.name}</h4>
            <p>
              <Link disabled={pageDelete.isPending} params={{ id: String(page.id) }} to="/pages/$id">
                Edit
              </Link>
            </p>
            <button disabled={pageDelete.isPending} onClick={() => pageDelete.mutate({ entry: page })}>
              Delete
            </button>
            <button disabled={pageCopy.isPending} onClick={() => pageCopy.mutate({ root: { store: 'pages', id: page.id } })}>
              Duplicate
            </button>
            <button disabled={pageExport.isPending} onClick={() => pageExport.mutate({ page })}>
              Export
            </button>
            {pageDelete.isError && <p>{pageDelete.error.message}</p>}
            <p>{page.status}</p>
            <p>
              <b>Created at</b>
              <time>{page.createdAt.toLocaleString()}</time>
            </p>
            <p>
              <b>Updated at</b>
              <time>{page.updatedAt.toLocaleString()}</time>
            </p>
          </li>
        ))}
      </ul>
    </>
  )
}
