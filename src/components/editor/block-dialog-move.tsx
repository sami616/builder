import { Check, ChevronsUpDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Button } from '../ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'
import clsx from 'clsx'
import { Input } from '../ui/input'
import { validateSlotBlock, validateSlotMax, validateDropSelf } from './block-layer-item-slot'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm, useWatch } from 'react-hook-form'
import { useRouteContext } from '@tanstack/react-router'
import { Block, Page } from '@/db'
import { useBlockMove } from '@/hooks/use-block-move'
import { isBlock } from '@/api'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'

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
      // if (props.block.id === block.id) return false
      return Object.keys(block.slots).length
    })

  const allNodes = [page, ...allBlocks]
  const selectedParentId = useWatch({ control: blockMoveForm.control, name: 'parentId' })
  const selectedNode = allNodes.find((node) => node?.id === Number(selectedParentId))
  const selectedSlot = useWatch({ control: blockMoveForm.control, name: 'slot' })
  const selectedIndex = useWatch({ control: blockMoveForm.control, name: 'index' })
  const selectedSlotArray = selectedNode?.slots[selectedSlot]

  if (!selectedNode) return null

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
                                  // validateDropSelf(sourceEl: document.querySelector(`[data-drop-id="block-${node.id}"]`), targetEl: null)
                                  // validateSlotBlock({ source: { data: { id: 'component', type: key } }, target: { parent: props.parent } })
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
                                          blockMoveForm.setValue('slot', Object.keys(node.slots)[0])
                                          if (node.slots[Object.keys(node.slots)[0]].length) {
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
                          {isBlock(selectedNode) ? context.config[selectedNode.type].slots?.[field.value]?.name : field.value}
                          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="start">
                        {Object.keys(selectedNode.slots).map((slot) => {
                          return (
                            <DropdownMenuItem
                              onSelect={() => {
                                field.onChange(slot)
                                if (selectedNode.slots[slot].length) {
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