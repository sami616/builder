import { usePageExport } from '#hooks/use-page-export.ts'
import { usePageExportMany } from '#hooks/use-page-export-many.ts'
import { usePageCopy } from '#hooks/use-page-copy.ts'
import { Button } from '#components/ui/button.tsx'
import { Trash, FileDown, Copy, Loader2 } from 'lucide-react'
import { Page } from '#db.ts'
import { type Table } from '@tanstack/react-table'
import { usePageCopyMany } from '#hooks/use-page-copy-many.ts'
import { useIsMutating } from '@tanstack/react-query'

export function PageTableActions(props: { table: Table<Page>; selectedPages: Page[]; setIsDeleteDialogOpen: (open: boolean) => void }) {
  if (props.selectedPages.length === 0) return null

  const { pageExport } = usePageExport()
  const { pageExportMany } = usePageExportMany()
  const { pageCopy } = usePageCopy()
  const { pageCopyMany } = usePageCopyMany()
  const pageCRUDPending = Boolean(useIsMutating({ mutationKey: ['page'] }))
  const pageDeletePending = Boolean(useIsMutating({ mutationKey: ['page', 'delete'] }))
  const pageCopyPending = Boolean(useIsMutating({ mutationKey: ['page', 'copy'] }))
  const pageExportPending = Boolean(useIsMutating({ mutationKey: ['page', 'export'] }))

  return (
    <div className="bg-gray-50 p-4 grid gap-3">
      <small>
        {Object.keys(props.selectedPages).length} pages selected{' '}
        <Button disabled={pageCRUDPending} onClick={() => props.table.resetRowSelection()} variant="link" size="sm">
          (Clear selection)
        </Button>
      </small>
      <div className="flex gap-2 items-center">
        <>
          <Button
            disabled={pageCRUDPending}
            onClick={async () => {
              if (props.selectedPages.length === 1) {
                const [page] = props.selectedPages
                await pageCopy({ id: page.id })
              } else {
                await pageCopyMany({ ids: props.selectedPages.map((page) => page.id) })
              }
              props.table.resetRowSelection()
              props.table.resetSorting()
            }}
            variant="outline"
          >
            {pageCopyPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Copy className="size-4 mr-2" />}
            Duplicate
          </Button>

          <Button
            disabled={pageCRUDPending}
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              props.setIsDeleteDialogOpen(true)
            }}
          >
            {pageDeletePending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Trash className="size-4 mr-2" />}
            Delete
          </Button>
          <Button
            disabled={pageCRUDPending}
            onClick={async () => {
              if (props.selectedPages.length === 1) {
                const [page] = props.selectedPages
                await pageExport({ page })
              } else {
                await pageExportMany({ pages: props.selectedPages })
              }
              props.table.resetRowSelection()
            }}
            variant="outline"
          >
            {pageExportPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <FileDown className="size-4 mr-2" />}
            Export
          </Button>
        </>
      </div>
    </div>
  )
}
