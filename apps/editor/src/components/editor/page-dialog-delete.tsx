import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#components/ui/alert-dialog.tsx'
import { Button } from '#components/ui/button.tsx'
import { type DBStores } from '@repo/lib'
import { usePageDeleteMany } from '#hooks/use-page-delete-many.ts'
import { usePageDelete } from '#hooks/use-page-delete.ts'
import { useIsMutating } from '@tanstack/react-query'
import { type Table } from '@tanstack/react-table'
import { Loader2, Trash } from 'lucide-react'

export function PageDialogDelete(props: {
  table: Table<DBStores['Page']>
  selectedPages: DBStores['Page'][]
  deleteDialogOpen: boolean
  setIsDeleteDialogOpen: (open: boolean) => void
}) {
  const { pageDeleteMany } = usePageDeleteMany()
  const { pageDelete } = usePageDelete()
  const pageDeletePending = Boolean(useIsMutating({ mutationKey: ['page', 'delete'] }))
  const isSelectionMany = props.selectedPages.length > 1

  return (
    <AlertDialog
      onOpenChange={(bool) => {
        if (bool === false) {
          if (!pageDeletePending) {
            props.setIsDeleteDialogOpen(bool)
            props.table.resetRowSelection()
          }
        } else {
          props.setIsDeleteDialogOpen(bool)
        }
      }}
      open={props.deleteDialogOpen}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your {isSelectionMany ? `(${props.selectedPages.length})` : ''} page
            {isSelectionMany ? `s` : ''}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pageDeletePending}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={pageDeletePending}
            onClick={async (e) => {
              e.stopPropagation()
              const pages = props.selectedPages
              if (pages.length === 1) {
                const [entry] = pages
                await pageDelete({ entry })
              } else {
                await pageDeleteMany({ entries: pages })
              }
              props.table.resetRowSelection()
              props.setIsDeleteDialogOpen(false)
            }}
          >
            {pageDeletePending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
