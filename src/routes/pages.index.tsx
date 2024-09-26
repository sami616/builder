import { createFileRoute, Link } from '@tanstack/react-router'
import { usePageAdd } from '../utils/usePageAdd'
import { usePageExport } from '../utils/usePageExport'
import { usePageExportMany } from '../utils/usePageExportMany'
import { usePageImport } from '../utils/usePageImport'
import { usePageCopy } from '../utils/usePageCopy'
import { usePageDeleteMany } from '../utils/usePageDeleteMany'
import { pageGetManyOpts, usePageGetMany } from '../utils/usePageGetMany'
import { Copy, CopyIcon, Filter, FilterX, Loader2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowUp, ArrowDown, Trash, Clipboard, FileDown, Settings, Import } from 'lucide-react'

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { Page } from '@/db'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { useMemo, useState } from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { usePageDelete } from '@/utils/usePageDelete'
import { usePageCopyMany } from '@/utils/usePageCopyMany'
import { Skeleton } from '@/components/ui/skeleton'

// Route
export const Route = createFileRoute('/pages/')({
  component: Pages,
  loader: ({ context }) => context.queryClient.ensureQueryData(pageGetManyOpts({ context })),
  pendingComponent: () => (
    <div className="m-2">
      <Skeleton className="w-full h-14 mt-4 mb-4" />
      <Skeleton className="w-full h-svh" />
    </div>
  ),
  errorComponent: () => <p>Error!</p>,
})

const formSchema = z.object({ name: z.string() })

// Route Component
export function Pages() {
  const navigate = Route.useNavigate()
  const { pageGetMany } = usePageGetMany()
  const { pageAdd } = usePageAdd()
  const { pageExport } = usePageExport()
  const { pageExportMany } = usePageExportMany()
  const { pageImport } = usePageImport()
  const { pageCopy } = usePageCopy()
  const { pageCopyMany } = usePageCopyMany()
  const { pageDeleteMany } = usePageDeleteMany()
  const { pageDelete } = usePageDelete()
  const [deleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [addNewPageDialogOpen, setAddNewPageDialogOpen] = useState(false)

  const CRUDPending =
    pageAdd.isPending ||
    pageExport.isPending ||
    pageExportMany.isPending ||
    pageImport.isPending ||
    pageCopy.isPending ||
    pageCopyMany.isPending ||
    pageDelete.isPending ||
    pageDeleteMany.isPending

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const id = await pageAdd.mutateAsync({
      entry: {
        store: 'pages',
        name: values.name,
        createdAt: new Date(),
        updatedAt: new Date(),
        slots: { root: [] },
        status: 'draft',
      },
    })
    navigate({ to: `/pages/${id}` })
  }

  const columns: ColumnDef<Page>[] = useMemo(
    () => [
      {
        id: 'select',
        enableHiding: false,
        meta: { noLink: true },
        header: ({ table }) => {
          return (
            <Checkbox
              disabled={CRUDPending}
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
              disabled={!row.getCanSelect() || CRUDPending}
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
          return (
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <Settings className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle column display</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.columnDef.header as string}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        enableHiding: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const page = row.original
          return (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger disabled={CRUDPending} asChild>
                  <Button disabled={CRUDPending} variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open actions</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled={CRUDPending} asChild>
                    <Link disabled={CRUDPending} params={{ id: String(page.id) }} to="/pages/$id">
                      Open
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />

                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    disabled={CRUDPending}
                    onClick={async (e) => {
                      e.stopPropagation()
                      table.setRowSelection(() => ({ [page.id]: true }))
                      await pageCopy.mutateAsync({ id: page.id })
                      table.resetRowSelection()
                      table.resetSorting()
                    }}
                  >
                    <CopyIcon className="opacity-40 size-4 mr-2" /> Duplicate
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    disabled={CRUDPending}
                    onClick={(e) => {
                      e.stopPropagation()
                      table.setRowSelection(() => ({ [page.id]: true }))
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash className="opacity-40 size-4 mr-2" /> Delete
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    disabled={CRUDPending}
                    onClick={async (e) => {
                      e.stopPropagation()
                      table.setRowSelection(() => ({ [page.id]: true }))
                      await pageExport.mutateAsync({ page })
                      table.resetRowSelection()
                    }}
                  >
                    <FileDown className="opacity-40 size-4 mr-2" /> Export
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      navigator.clipboard.writeText(String(page.id))
                    }}
                  >
                    <Clipboard className="opacity-40 size-4 mr-2" /> Copy ID
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )
        },
      },
    ],
    [CRUDPending],
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

  const rowSelection = table.getState().rowSelection
  const columnFilters = table.getState().columnFilters
  const selectedPages = table.getSelectedRowModel().rows.map((row) => row.original)

  return (
    <>
      <div className="p-2">
        {pageGetMany.isRefetching && <p>Refetching...</p>}

        <div className="bg-white/90 sticky z-10 top-0">
          <div className=" gap-2 flex justify-between items-center py-4">
            <div className="gap-2 flex items-center">
              <Input
                placeholder={`Search pages`}
                value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="relative ">
                    {columnFilters.filter((col) => col.id !== 'name').length > 0 ? (
                      <Badge className="absolute px-0 -top-1 -right-1 size-3 rounded-xl"></Badge>
                    ) : null}
                    <Filter className="size-4 mr-2" />
                    Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    onValueChange={(status) => table.getColumn('status')?.setFilterValue(status)}
                    value={table.getColumn('status')?.getFilterValue() as string}
                  >
                    <DropdownMenuRadioItem value="draft">Draft</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="published">Published</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  {columnFilters.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => table.resetColumnFilters()}>
                        <FilterX className="size-4 mr-2 opacity-40" />
                        Clear all
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="gap-2 flex">
              <Button variant="outline" disabled={CRUDPending} onClick={() => pageImport.mutate()}>
                {pageImport.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Import className="size-4 mr-2" />}Import
              </Button>

              <Button disabled={CRUDPending} onClick={() => setAddNewPageDialogOpen(true)} variant="default">
                Add new
              </Button>
            </div>
          </div>
          {selectedPages.length !== 0 && (
            <div className="bg-gray-50 p-4 grid gap-3">
              <small>
                {Object.keys(rowSelection).length} pages selected{' '}
                <Button disabled={CRUDPending} onClick={() => table.resetRowSelection()} variant="link" size="sm">
                  (Clear selection)
                </Button>
              </small>
              <div className="flex gap-2 items-center">
                <>
                  <Button
                    disabled={CRUDPending}
                    onClick={async () => {
                      if (selectedPages.length === 1) {
                        const [page] = selectedPages
                        await pageCopy.mutateAsync({ id: page.id })
                      } else {
                        await pageCopyMany.mutateAsync({ ids: selectedPages.map((page) => page.id) })
                      }
                      table.resetRowSelection()
                    }}
                    variant="outline"
                  >
                    {pageCopy.isPending || pageCopyMany.isPending ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <Copy className="size-4 mr-2" />
                    )}
                    Duplicate
                  </Button>

                  <Button
                    disabled={CRUDPending}
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    {pageDeleteMany.isPending || pageDelete.isPending ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <Trash className="size-4 mr-2" />
                    )}
                    Delete
                  </Button>
                  <Button
                    disabled={CRUDPending}
                    onClick={async () => {
                      if (selectedPages.length === 1) {
                        const [page] = selectedPages
                        await pageExport.mutateAsync({ page })
                      } else {
                        await pageExportMany.mutateAsync({ pages: selectedPages })
                      }
                      table.resetRowSelection()
                    }}
                    variant="outline"
                  >
                    {pageExportMany.isPending || pageExport.isPending ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <FileDown className="size-4 mr-2" />
                    )}{' '}
                    Export
                  </Button>
                </>
              </div>
            </div>
          )}
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
                      onClick={() => {
                        // @ts-ignore
                        if (!cell.column.columnDef.meta?.noLink) {
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
      </div>
      <AlertDialog
        onOpenChange={(bool) => {
          if (bool === false) {
            if (!pageDeleteMany.isPending || !pageDelete.isPending) {
              setIsDeleteDialogOpen(bool)
              table.resetRowSelection()
            }
          } else {
            setIsDeleteDialogOpen(bool)
          }
        }}
        open={deleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your {selectedPages.length > 1 ? `(${selectedPages.length})` : ''} page
              {selectedPages.length > 1 ? `s` : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pageDeleteMany.isPending}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={pageDeleteMany.isPending}
              onClick={async (e) => {
                e.stopPropagation()
                const pages = selectedPages
                if (pages.length === 1) {
                  const [entry] = pages
                  await pageDelete.mutateAsync({ entry })
                } else {
                  await pageDeleteMany.mutateAsync({ entries: pages })
                }
                table.resetRowSelection()
                setIsDeleteDialogOpen(false)
              }}
            >
              {pageDeleteMany.isPending || pageDelete.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={addNewPageDialogOpen}
        onOpenChange={(bool) => {
          if (bool === false) {
            if (!pageAdd.isPending) {
              setAddNewPageDialogOpen(bool)
            }
          } else {
            setAddNewPageDialogOpen(bool)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create page</DialogTitle>
            <DialogDescription>Create and design a new page for your site.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input required placeholder="My landing page" {...field} />
                    </FormControl>
                    <FormDescription>Set a name for your new page</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button disabled={pageAdd.isPending} variant="outline">
                    Close
                  </Button>
                </DialogClose>
                <Button disabled={pageAdd.isPending} type="submit" variant="default">
                  {pageAdd.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
