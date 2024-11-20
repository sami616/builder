import { isBlock } from '#api.ts'
import { validateDropSelf, validateSlotBlock } from '#components/editor/block-layer-item-slot.tsx'
import { Button } from '#components/ui/button.tsx'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '#components/ui/command.tsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '#components/ui/dialog.tsx'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '#components/ui/dropdown-menu.tsx'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '#components/ui/form.tsx'
import { Input } from '#components/ui/input.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '#components/ui/popover.tsx'
import { type Block, type Page } from '#db.ts'
import { useBlockMove } from '#hooks/use-block-move.ts'
import { context } from '#main.tsx'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Dispatch, SetStateAction, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

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
      return Object.keys(block.slots).length
    })

  const allNodes = [page, ...allBlocks]
  const selectedParentId = useWatch({ control: blockMoveForm.control, name: 'parentId' })
  const selectedNode = allNodes.find((node) => node?.id === Number(selectedParentId))
  const selectedSlot = useWatch({ control: blockMoveForm.control, name: 'slot' })
  const selectedIndex = useWatch({ control: blockMoveForm.control, name: 'index' })

  const filteredSlots = useMemo(() => {
    if (!selectedNode) return {}
    return Object.keys(selectedNode.slots).reduce(
      (acc, curr) => {
        try {
          if (isBlock(props.block) && isBlock(selectedNode)) {
            validateSlotBlock({
              source: { data: props.block },
              target: { parent: { node: selectedNode, slot: curr } },
            })
          }
          acc[curr] = selectedNode.slots[curr]
          return acc
        } catch (e) {
          return acc
        }
      },
      {} as { [key: string]: number[] },
    )
  }, [selectedNode, props.block])

  if (!selectedNode) return null

  const selectedSlotArray = filteredSlots[selectedSlot]

  return (
    <Dialog
      open={props.open}
      onOpenChange={(bool) => {
        props.setOpen(bool)
        if (!bool) blockMoveForm.reset()
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
              function calcEdge() {
                if (!values.index) return null
                if (values.slot !== props.parent.slot) return 'top'
                return Number(values.index) > props.index ? 'bottom' : 'top'
              }
              blockMove({
                source: { id: 'block', index: props.index, node: props.block, parent: props.parent },
                target: {
                  index: values.index ? Number(values.index) - 1 : undefined,
                  edge: calcEdge(),
                  parent: { node: selectedNode, slot: values.slot },
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
                          {selectedNode ? (isBlock(selectedNode) ? selectedNode.name : selectedNode.title) : 'Please select'}
                          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search ..." />
                          <CommandList>
                            <CommandEmpty>No parent found.</CommandEmpty>
                            <CommandGroup>
                              {allNodes.map((node) => {
                                if (!node) return null
                                try {
                                  if (isBlock(node)) {
                                    const sourceEl = document.querySelector(`#canvas [data-drop-id="block-${props.block.id}"]`)
                                    const targetEl = document.querySelector(`#canvas [data-drop-id="block-${node.id}"]`)
                                    if (sourceEl && targetEl) {
                                      validateDropSelf(sourceEl, targetEl)
                                    }
                                  }

                                  return (
                                    <CommandItem
                                      key={node.id}
                                      value={String(node.id)}
                                      onSelect={(args) => {
                                        setParentPickerOpen(false)
                                        field.onChange(args)
                                        if (node.id === props.parent.node.id) {
                                          blockMoveForm.setValue('slot', props.parent.slot)
                                          blockMoveForm.setValue('index', String(Number(props.index + 1)))
                                        } else {
                                          blockMoveForm.setValue('slot', '')
                                          if (filteredSlots[Object.keys(filteredSlots)[0]].length) {
                                            blockMoveForm.setValue('index', '1')
                                          } else {
                                            blockMoveForm.setValue('index', '')
                                          }
                                        }
                                      }}
                                    >
                                      <Check className={clsx('mr-2 size-4', Number(field.value) === node.id ? 'opacity-100' : 'opacity-0')} />
                                      {isBlock(node) ? node.name : node.title}
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
                          {field.value
                            ? isBlock(selectedNode)
                              ? context.config[selectedNode.type].slots?.[field.value]?.name
                              : field.value
                            : 'Select a slot'}
                          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="start">
                        {Object.keys(filteredSlots).map((slot) => {
                          return (
                            <DropdownMenuItem
                              onSelect={() => {
                                field.onChange(slot)
                                if (filteredSlots[slot].length) {
                                  blockMoveForm.setValue('index', '1')
                                } else {
                                  blockMoveForm.setValue('index', '')
                                }
                              }}
                            >
                              <Check className={clsx('mr-2 size-4', field.value === slot ? 'opacity-100' : 'opacity-0')} />
                              {isBlock(selectedNode) ? context.config[selectedNode.type].slots?.[slot].name : slot}
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

            {selectedIndex && (
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
            <Button disabled={!selectedNode || !selectedSlot} type="submit">
              Move component
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
