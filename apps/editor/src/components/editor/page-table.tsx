import { PageAdd } from '#components/editor/page-dialog-add.tsx'
import { socket } from '#lib/utils.ts'
import { PageDialogDelete } from '#components/editor/page-dialog-delete.tsx'
import { PageDialogEdit } from '#components/editor/page-dialog-edit.tsx'
import { PageTableActionsRow } from '#components/editor/page-table-actions-row.tsx'
import { PageTableActions } from '#components/editor/page-table-actions.tsx'
import { PageTableColumnFilters } from '#components/editor/page-table-column-filters.tsx'
import { PageTableFilters } from '#components/editor/page-table-filters.tsx'
import { Badge } from '#components/ui/badge.tsx'
import { Button } from '#components/ui/button.tsx'
import { Checkbox } from '#components/ui/checkbox.tsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#components/ui/table.tsx'
import { type Page } from '#db.ts'
import { usePageGetMany } from '#hooks/use-page-get-many.ts'
import { usePageImport } from '#hooks/use-page-import.ts'
import { useIsMutating } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import clsx from 'clsx'
import { ArrowDown, ArrowUp, Import, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

export function PageTable() {
  const navigate = useNavigate({ from: '/pages' })
  const { pageGetMany } = usePageGetMany()
  const { pageImport } = usePageImport()
  const [deleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setIsEditDialogOpen] = useState(false)
  const pageCRUDPending = Boolean(useIsMutating({ mutationKey: ['page'] }))
  const [publishing, setPublishing] = useState<Array<number>>([])

  useEffect(() => {
    socket.emit('checkPublishStatus')
    socket.on('checkPublishStatus', setPublishing)
    return () => {
      socket.off('checkPublishStatus', setPublishing)
    }
  }, [])

  const columns: ColumnDef<Page>[] = useMemo(
    () => [
      {
        id: 'select',
        enableHiding: false,
        meta: { noLink: true },
        header: ({ table }) => {
          return (
            <Checkbox
              disabled={pageCRUDPending}
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          )
        },
        cell: ({ row }) => {
          return (
            <Checkbox
              onClick={(e) => e.stopPropagation()}
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect() || pageCRUDPending}
              onCheckedChange={row.getToggleSelectedHandler()}
              arial-label="Select row"
            />
          )
        },
      },
      {
        accessorKey: 'title',
        header: 'Title',
        enableHiding: false,
      },
      {
        accessorKey: 'slug',
        header: 'Slug',
      },
      {
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        filterFn: 'equals',
        cell: ({ row }) => {
          const status = row.getValue<Page['status']>('status')
          return (
            <Badge className="capitalize" variant="secondary">
              {publishing.includes(Number(row.id)) ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" /> Publishing
                </>
              ) : (
                status
              )}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created at',
        enableColumnFilter: false,
        cell: ({ row }) => {
          const createdAt = row.getValue<Page['createdAt']>('createdAt')
          return createdAt.toLocaleString()
        },
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated at',
        enableColumnFilter: false,
        cell: ({ row }) => {
          const updatedAt = row.getValue<Page['updatedAt']>('updatedAt')
          return updatedAt.toLocaleString()
        },
      },
      {
        accessorKey: 'publishedAt',
        header: 'Published at',
        enableColumnFilter: false,
        cell: ({ row }) => {
          const publishedAt = row.getValue<Page['publishedAt']>('publishedAt')
          return publishedAt?.toLocaleString() ?? '-'
        },
      },
      {
        id: 'actions',
        meta: { noLink: true },
        header: () => {
          return <PageTableColumnFilters table={table} />
        },
        enableHiding: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          return (
            <PageTableActionsRow
              disabled={publishing.includes(Number(row.id))}
              page={row.original}
              table={table}
              setIsEditDialogOpen={setIsEditDialogOpen}
              setIsDeleteDialogOpen={setIsDeleteDialogOpen}
            />
          )
        },
      },
    ],
    [pageCRUDPending, publishing],
  )

  const table = useReactTable({
    data: pageGetMany.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableSortingRemoval: false,
    enableRowSelection: (row) => !publishing.includes(row.original.id),
    getRowId: (row) => String(row.id),
    initialState: {
      sorting: [{ id: 'createdAt', desc: true }],
      pagination: { pageIndex: 0, pageSize: 25 },
      columnVisibility: {},
      columnFilters: [],
    },
  })

  const selectedPages = table.getSelectedRowModel().rows.map((row) => row.original)

  return (
    <>
      <div className="bg-white/90 sticky z-10 top-0">
        <div className=" gap-2 flex justify-between items-center py-4">
          <PageTableFilters table={table} />
          <div className="gap-2 flex">
            <Button variant="outline" disabled={pageCRUDPending} onClick={() => pageImport()}>
              <Import size={16} className="mr-2" /> Import
            </Button>
            <PageAdd />
          </div>
        </div>
        <PageTableActions table={table} selectedPages={selectedPages} setIsDeleteDialogOpen={setIsDeleteDialogOpen} />
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isSortable = header.column.getCanSort()
                const direction = header.column.getIsSorted()
                return (
                  <TableHead onClick={header.column.getToggleSortingHandler()} key={header.id}>
                    <div className={clsx(['flex', 'gap-2', isSortable && 'cursor-pointer'])}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {direction === 'asc' && <ArrowUp size={16} />}
                      {direction === 'desc' && <ArrowDown size={16} />}
                    </div>
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const isPublishing = publishing.includes(row.original.id)
              return (
                <TableRow
                  className={clsx('cursor-pointer', isPublishing && 'opacity-50')}
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className={clsx([pageCRUDPending && 'cursor-not-allowed'])}
                      onClick={() => {
                        console.log({ rowid: row.id, publishing })
                        // @ts-ignore
                        if (!cell.column.columnDef.meta?.noLink && !pageCRUDPending) {
                          navigate({ to: `/pages/${row.original.id}` })
                        }
                      }}
                      key={cell.id}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex gap-2 items-center justify-end">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
      <PageDialogDelete
        table={table}
        selectedPages={selectedPages}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
      />
      {selectedPages[0] && <PageDialogEdit selectedPage={selectedPages[0]} open={editDialogOpen} setOpen={setIsEditDialogOpen} />}
    </>
  )
}
