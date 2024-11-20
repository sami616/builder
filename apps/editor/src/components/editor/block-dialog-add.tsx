import { validateSlotBlock } from '#components/editor/block-layer-item-slot.tsx'
import { Button } from '#components/ui/button.tsx'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '#components/ui/command.tsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '#components/ui/dialog.tsx'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '#components/ui/form.tsx'
import { Input } from '#components/ui/input.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '#components/ui/popover.tsx'
import { ToggleGroup, ToggleGroupItem } from '#components/ui/toggle-group.tsx'
import { type Block, type Page } from '#db.ts'
import { useBlockAdd } from '#hooks/use-block-add.ts'
import { context } from '#main.tsx'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { Check, ChevronsUpDown } from 'lucide-react'
import { type Dispatch, type SetStateAction, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const blockAddSchema = z.object({
  name: z.string(),
  edge: z.union([z.literal('top'), z.literal('bottom')]),
  component: z.string(),
})

export function BlockDialogAdd(props: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  index: number
  parent: { slot: string; node: Block | Page }
}) {
  const [blockPickerOpen, setBlockPickerOpen] = useState(false)
  const { blockAdd } = useBlockAdd()
  const blockAddForm = useForm<z.infer<typeof blockAddSchema>>({
    resolver: zodResolver(blockAddSchema),
    defaultValues: { name: '', edge: 'bottom', component: '' },
  })

  return (
    <Dialog
      open={props.open}
      onOpenChange={(bool) => {
        blockAddForm.reset()
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
          <DialogTitle>Add component</DialogTitle>
          <DialogDescription>Add a new component to your page.</DialogDescription>
        </DialogHeader>

        <Form {...blockAddForm}>
          <form
            onSubmit={blockAddForm.handleSubmit(async (values) => {
              blockAdd({
                name: values.name.trim() === '' ? undefined : values.name.trim(),
                source: { id: 'component', type: values.component },
                target: { edge: values.edge, parent: props.parent, index: props.index },
              })
              props.setOpen(false)
            })}
            className="grid gap-4"
          >
            <FormField
              control={blockAddForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={blockAddForm.control}
              name="edge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placement</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      size="sm"
                      value={field.value ?? undefined}
                      onValueChange={(val) => {
                        if (val) field.onChange(val)
                      }}
                      type="single"
                    >
                      <ToggleGroupItem className="grow" value="bottom">
                        Below
                      </ToggleGroupItem>
                      <ToggleGroupItem className="grow" value="top">
                        Above
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={blockAddForm.control}
              name="component"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Component</FormLabel>
                  <FormControl>
                    <Popover open={blockPickerOpen} onOpenChange={setBlockPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={blockPickerOpen} className="w-full justify-between">
                          {field.value ? Object.keys(context.config).find((key) => key === field.value) : 'Select component...'}
                          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search components..." />
                          <CommandList>
                            <CommandEmpty>No component found.</CommandEmpty>
                            <CommandGroup>
                              {Object.entries(context.config).map(([key, configItem]) => {
                                try {
                                  validateSlotBlock({ source: { data: { id: 'component', type: key } }, target: { parent: props.parent } })
                                  return (
                                    <CommandItem
                                      key={key}
                                      value={key}
                                      onSelect={(args) => {
                                        setBlockPickerOpen(false)
                                        field.onChange(args)
                                      }}
                                    >
                                      <Check className={clsx('mr-2 size-4', field.value === key ? 'opacity-100' : 'opacity-0')} />
                                      {configItem.name}
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

            <Button disabled={blockAddForm.getValues('component') === ''} type="submit">
              Add component
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
