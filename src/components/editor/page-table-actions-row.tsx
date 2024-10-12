import { usePageExport } from '@/hooks/use-page-export'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePageCopy } from '@/hooks/use-page-copy'
import { Button } from '@/components/ui/button'
import { Clipboard, Trash, FileDown, CopyIcon, MoreHorizontal } from 'lucide-react'
import { Page } from '@/db'
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
          <MoreHorizontal size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
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
            await pageCopy({ id: props.page.id })
            props.table.resetRowSelection()
            props.table.resetSorting()
          }}
        >
          <CopyIcon size={14} className="opacity-40  mr-2" /> Duplicate
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={pageCRUDPending}
          onClick={(e) => {
            e.stopPropagation()
            props.table.setRowSelection(() => ({ [props.page.id]: true }))
            props.setIsDeleteDialogOpen(true)
          }}
        >
          <Trash size={14} className="opacity-40 mr-2" /> Delete
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={pageCRUDPending}
          onClick={async (e) => {
            e.stopPropagation()
            props.table.setRowSelection(() => ({ [props.page.id]: true }))
            await pageExport({ page: props.page })
            props.table.resetRowSelection()
          }}
        >
          <FileDown size={14} className="opacity-40 mr-2" /> Export
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            navigator.clipboard.writeText(String(props.page.id))
          }}
        >
          <Clipboard size={14} className="opacity-40  mr-2" /> Copy ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
