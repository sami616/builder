import { useNavigate } from '@tanstack/react-router'
import { usePageImport } from '@/hooks/use-page-import'
import { usePageGetMany } from '@/hooks/use-page-get-many'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowUp, ArrowDown, Import } from 'lucide-react'
import { Page } from '@/db'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { PageTableFilters } from '@/components/editor/page-table-filters'
import { useIsMutating } from '@tanstack/react-query'
import { PageTableActions } from '@/components/editor/page-table-actions'
import { PageTableActionsRow } from '@/components/editor/page-table-actions-row'
import { PageTableColumnFilters } from '@/components/editor/page-table-column-filters'
import { PageDialogDelete } from '@/components/editor/page-dialog-delete'
import { PageAdd } from '@/components/editor/page-dialog-add'
import clsx from 'clsx'
import { PageDialogEdit } from './page-dialog-edit'

export function PageTable() {
  const navigate = useNavigate({ from: '/pages' })
  const { pageGetMany } = usePageGetMany()
  const { pageImport } = usePageImport()
  const [deleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setIsEditDialogOpen] = useState(false)
  const pageCRUDPending = Boolean(useIsMutating({ mutationKey: ['page'] }))

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
          const status = String(row.getValue('status'))
          return (
            <Badge className="capitalize" variant="secondary">
              {status}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created at',
        enableColumnFilter: false,
        cell: ({ row }) => {
          const createdAt = row.getValue('createdAt') as Date
          return createdAt.toLocaleString()
        },
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated at',
        enableColumnFilter: false,
        cell: ({ row }) => {
          const updatedAt = row.getValue('updatedAt') as Date
          return updatedAt.toLocaleString()
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
              page={row.original}
              table={table}
              setIsEditDialogOpen={setIsEditDialogOpen}
              setIsDeleteDialogOpen={setIsDeleteDialogOpen}
            />
          )
        },
      },
    ],
    [pageCRUDPending],
  )

  const table = useReactTable({
    data: pageGetMany.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableSortingRemoval: false,
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
            table.getRowModel().rows.map((row) => (
              <TableRow className="cursor-pointer" key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    className={clsx([pageCRUDPending && 'cursor-not-allowed'])}
                    onClick={() => {
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
            ))
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
