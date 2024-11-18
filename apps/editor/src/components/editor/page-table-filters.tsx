'use no memo'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table } from '@tanstack/react-table'
import { Page } from '@/db'

export function PageTableFilters(props: { table: Table<Page> }) {
  const columnFilters = props.table.getState().columnFilters
  console.log(props.table.getColumn('status')?.getFilterValue())
  return (
    <div className="gap-2 flex items-center">
      <Input
        placeholder={`Search pages`}
        value={(props.table.getColumn('title')?.getFilterValue() as string) ?? ''}
        onChange={(event) => props.table.getColumn('title')?.setFilterValue(event.target.value)}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="relative ">
            {columnFilters.filter((col) => col.id !== 'title').length > 0 ? (
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
            onValueChange={(status) => {
              if (status === props.table.getColumn('status')?.getFilterValue()) {
                props.table.getColumn('status')?.setFilterValue(undefined)
              } else {
                props.table.getColumn('status')?.setFilterValue(status)
              }
            }}
            value={props.table.getColumn('status')?.getFilterValue() as string}
          >
            <DropdownMenuRadioItem value="Unpublished">Unpublished</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Published">Published</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
