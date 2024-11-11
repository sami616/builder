import { Check, ChevronsUpDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Button } from '../ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'
import clsx from 'clsx'
import { Input } from '../ui/input'
import { validateSlotBlock } from './block-layer-item-slot'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm, useWatch } from 'react-hook-form'
import { useRouteContext } from '@tanstack/react-router'
import { Block, Page } from '@/db'
import { useBlockMove } from '@/hooks/use-block-move'
import { isBlock } from '@/api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

const blockMoveSchema = z.object({
  parentId: z.string(),
  slot: z.string(),
  index: z.string(),
})

export function BlockDialogMove(props: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  index: number
  block: Block
  parent: { slot: string; node: Block | Page }
}) {
  const context = useRouteContext({ from: '/pages/$id' })
  const [parentPickerOpen, setParentPickerOpen] = useState(false)
  const [slotPickerOpen, setSlotPickerOpen] = useState(false)
  const { blockMove } = useBlockMove()

  const blockMoveForm = useForm<z.infer<typeof blockMoveSchema>>({
    resolver: zodResolver(blockMoveSchema),
    defaultValues: { parentId: String(props.parent.node.id), slot: props.parent.slot, index: String(Number(props.index) + 1) },
  })

  const page = context.queryClient
    .getQueriesData<Page>({
      queryKey: ['pages'],
      type: 'active',
    })
    .map(([_key, page]) => page)
    .at(0)

  const allBlocks = context.queryClient
    .getQueriesData<Block>({
      queryKey: ['blocks'],
      type: 'active',
    })
    .map(([_key, block]) => block)
    .filter((block) => {
      if (!block?.slots) return false
      if (props.block.id === block.id) return false
      return Object.keys(block.slots).length
    })

  const selectedBlock = [...allBlocks, page].find((block) => {
    return block?.id === Number(blockMoveForm.getValues('parentId'))
  })

  const selectedBlockLabel = selectedBlock ? (isBlock(selectedBlock) ? selectedBlock.name : selectedBlock.title) : 'Please select'
  const selectedParentId = useWatch({ control: blockMoveForm.control, name: 'parentId' })
  const selectedSlot = useWatch({ control: blockMoveForm.control, name: 'slot' })

  const selectedSlotArray = selectedBlock?.slots[selectedSlot]
  const selectedSlotHasItems = selectedSlotArray ? selectedSlotArray?.length > 0 : false

  useEffect(() => {
    blockMoveForm.setValue('index', String(Number(props.index) + 1))
    blockMoveForm.setValue('parentId', String(props.parent.node.id))
  }, [props.open, props.index, props.parent])

  useEffect(() => {
    if (Number(selectedParentId) === props.parent.node.id) {
      blockMoveForm.setValue('slot', props.parent.slot)
    } else {
      blockMoveForm.setValue('slot', '')
    }
  }, [selectedParentId, props.parent])

  return (
    <Dialog
      open={props.open}
      onOpenChange={(bool) => {
        props.setOpen(bool)
      }}
    >
      <DialogContent
        className="w-96"
        onMouseOver={(e) => e.stopPropagation()}
        onMouseOut={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Move {props.block.name}</DialogTitle>
          <DialogDescription>Move or reparent this component</DialogDescription>
        </DialogHeader>

        <Form {...blockMoveForm}>
          <form
            onSubmit={blockMoveForm.handleSubmit(async (values) => {
              const edge = Number(values.index) > props.index ? 'bottom' : 'top'
              if (selectedBlock === undefined) return
              blockMove({
                source: { id: 'block', index: props.index, node: props.block, parent: props.parent },
                target: {
                  index: selectedSlotHasItems ? Number(values.index) - 1 : undefined,
                  edge: selectedSlotHasItems ? edge : null,
                  parent: { node: selectedBlock, slot: values.slot },
                },
              })
              props.setOpen(false)
            })}
            className="grid gap-4"
          >
            <FormField
              control={blockMoveForm.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent</FormLabel>
                  <FormControl>
                    <Popover open={parentPickerOpen} onOpenChange={setParentPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={parentPickerOpen} className="w-full justify-between">
                          {selectedBlockLabel}
                          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search ..." />
                          <CommandList>
                            <CommandEmpty>No parent found.</CommandEmpty>
                            <CommandGroup>
                              {page && (
                                <CommandItem
                                  key={page.id}
                                  value={String(page.id)}
                                  onSelect={(args) => {
                                    setParentPickerOpen(false)
                                    field.onChange(args)
                                  }}
                                >
                                  <Check className={clsx('mr-2 size-4', Number(field.value) === page.id ? 'opacity-100' : 'opacity-0')} />
                                  {page?.title}
                                </CommandItem>
                              )}

                              {allBlocks.map((block) => {
                                if (!block) return null
                                try {
                                  // validateSlotBlock({ source: { data: { id: 'component', type: key } }, target: { parent: props.parent } })
                                  return (
                                    <CommandItem
                                      key={block.id}
                                      value={String(block.id)}
                                      onSelect={(args) => {
                                        setParentPickerOpen(false)
                                        field.onChange(args)
                                      }}
                                    >
                                      <Check className={clsx('mr-2 size-4', Number(field.value) === block.id ? 'opacity-100' : 'opacity-0')} />
                                      {block?.name}
                                    </CommandItem>
                                  )
                                } catch (e) {
                                  return null
                                }
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={blockMoveForm.control}
              name="slot"
              render={({ field }) => (
                <FormItem className="grid">
                  <FormLabel>Slot</FormLabel>
                  <FormControl>
                    <DropdownMenu
                      open={slotPickerOpen}
                      onOpenChange={(bool) => {
                        setSlotPickerOpen(bool)
                      }}
                    >
                      <DropdownMenuTrigger asChild className="shrink-0 stroke-gray-400 hover:enabled:stroke-gray-900">
                        <Button className="justify-between" variant="outline">
                          {field.value ? field.value : 'Select slot...'}
                          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuLabel>{selectedBlockLabel}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {selectedBlock?.slots &&
                          Object.keys(selectedBlock.slots).map((slot) => {
                            return (
                              <DropdownMenuItem onSelect={() => field.onChange(slot)}>
                                <Check className={clsx('mr-2 size-4', field.value === slot ? 'opacity-100' : 'opacity-0')} />
                                {slot}
                              </DropdownMenuItem>
                            )
                          })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedSlotHasItems && (
              <FormField
                control={blockMoveForm.control}
                name="index"
                render={({ field }) => (
                  <FormItem className="grid">
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input type="number" onChange={field.onChange} max={selectedSlotArray?.length} min={1} className="w-full" value={field.value} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button disabled={!selectedBlock || !selectedSlot} type="submit">
              Move component
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
