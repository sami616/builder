import { useNavigate } from '@tanstack/react-router'
import { usePageImport } from '../utils/usePageImport'
import { usePageGetMany } from '../utils/usePageGetMany'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, ArrowUp, ArrowDown, Import } from 'lucide-react'
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
import { PageTableFilters } from './PageTableFilters'
import { useIsMutating } from '@tanstack/react-query'
import { PageTableActions } from './PageTableActions'
import { PageTableActionsRow } from './PageTableActionsRow'
import { PageTableColumnFilters } from './PageTableColumnFilters'
import { PageDialogDelete } from './PageDialogDelete'
import { PageDialogAdd } from './PageDialogAdd'

export function PageTable() {
  const navigate = useNavigate({ from: '/pages' })
  const { pageGetMany } = usePageGetMany()
  const { pageImport } = usePageImport()
  const [deleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [addNewPageDialogOpen, setAddNewPageDialogOpen] = useState(false)
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
        accessorKey: 'name',
        header: 'Name',
        enableHiding: false,
      },
      {
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'status',
        header: 'Status',
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
          return <PageTableActionsRow page={row.original} table={table} setIsDeleteDialogOpen={setIsDeleteDialogOpen} />
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
            <Button variant="outline" disabled={pageCRUDPending} onClick={() => pageImport.mutate()}>
              {pageImport.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Import className="size-4 mr-2" />}Import
            </Button>
            <Button disabled={pageCRUDPending} onClick={() => setAddNewPageDialogOpen(true)} variant="default">
              Add new
            </Button>
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
                    <div className={`flex gap-2 ${isSortable ? 'cursor-pointer' : ''}`}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {direction === 'asc' && <ArrowUp className="h-4 w-4" />}
                      {direction === 'desc' && <ArrowDown className="h-4 w-4" />}
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
                    className={pageCRUDPending ? 'cursor-not-allowed' : ''}
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
        deleteDialogOpen={deleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        selectedPages={selectedPages}
      />
      <PageDialogAdd addNewPageDialogOpen={addNewPageDialogOpen} setAddNewPageDialogOpen={setAddNewPageDialogOpen} />
    </>
  )
}