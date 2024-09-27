import { usePageExport } from '@/hooks/usePageExport'
import { usePageExportMany } from '@/hooks/usePageExportMany'
import { usePageCopy } from '@/hooks/usePageCopy'
import { Copy, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Trash, FileDown } from 'lucide-react'
import { Page } from '@/db'
import { type Table } from '@tanstack/react-table'
import { usePageCopyMany } from '@/hooks/usePageCopyMany'
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
                await pageCopy.mutateAsync({ id: page.id })
              } else {
                await pageCopyMany.mutateAsync({ ids: props.selectedPages.map((page) => page.id) })
              }
              props.table.resetRowSelection()
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
                await pageExport.mutateAsync({ page })
              } else {
                await pageExportMany.mutateAsync({ pages: props.selectedPages })
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
