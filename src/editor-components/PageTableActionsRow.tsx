import { usePageExport } from '../utils/usePageExport'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePageCopy } from '../utils/usePageCopy'
import { Button } from '@/components/ui/button'
import { Trash, FileDown, CopyIcon, MoreHorizontal } from 'lucide-react'
import { Page } from '@/db'
import { Clipboard } from 'lucide-react'
import { type Table } from '@tanstack/react-table'
import { useIsMutating } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

export function PageTableActionsRow(props: { table: Table<Page>; page: Page; setIsDeleteDialogOpen: (open: boolean) => void }) {
  const { pageExport } = usePageExport()
  const { pageCopy } = usePageCopy()
  const pageCRUDPending = Boolean(useIsMutating({ mutationKey: ['page'] }))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={pageCRUDPending} asChild>
        <Button disabled={pageCRUDPending} variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open actions</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={pageCRUDPending} asChild>
          <Link disabled={pageCRUDPending} params={{ id: String(props.page.id) }} to="/pages/$id">
            Open
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          disabled={pageCRUDPending}
          onClick={async (e) => {
            e.stopPropagation()
            props.table.setRowSelection(() => ({ [props.page.id]: true }))
            await pageCopy.mutateAsync({ id: props.page.id })
            props.table.resetRowSelection()
            props.table.resetSorting()
          }}
        >
          <CopyIcon className="opacity-40 size-4 mr-2" /> Duplicate
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={pageCRUDPending}
          onClick={(e) => {
            e.stopPropagation()
            props.table.setRowSelection(() => ({ [props.page.id]: true }))
            props.setIsDeleteDialogOpen(true)
          }}
        >
          <Trash className="opacity-40 size-4 mr-2" /> Delete
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={pageCRUDPending}
          onClick={async (e) => {
            e.stopPropagation()
            props.table.setRowSelection(() => ({ [props.page.id]: true }))
            await pageExport.mutateAsync({ page: props.page })
            props.table.resetRowSelection()
          }}
        >
          <FileDown className="opacity-40 size-4 mr-2" /> Export
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            navigator.clipboard.writeText(String(props.page.id))
          }}
        >
          <Clipboard className="opacity-40 size-4 mr-2" /> Copy ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
