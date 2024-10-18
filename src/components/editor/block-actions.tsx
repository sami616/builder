import { Trash, Layout, Copy, Component, Check, ChevronsUpDown, MoreHorizontal } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '../ui/dropdown-menu'
import { useBlockDelete } from '@/hooks/use-block-delete'
import { useBlockCopy } from '@/hooks/use-block-copy'
import { useTemplateAdd } from '@/hooks/use-template-add'
import { useIsMutating } from '@tanstack/react-query'
import { Block } from '@/db'
import { ComponentProps, Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
import { BlockLayerItem } from './block-layer-item'
import { useActive } from '@/hooks/use-active'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Button } from '../ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import { useForm } from 'react-hook-form'
import { useBlockAdd } from '@/hooks/use-block-add'
import { useRouteContext } from '@tanstack/react-router'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import clsx from 'clsx'
import { Input } from '../ui/input'
import { validateSlotBlock, validateSlotMax } from './block-layer-item-slot'
import { useHovered } from '@/hooks/use-hovered'

type BlockLayerItemProps = ComponentProps<typeof BlockLayerItem>

const blockAddSchema = z.object({
  name: z.string(),
  edge: z.union([z.literal('top'), z.literal('bottom')]),
  component: z.string(),
})

const templateAddSchema = z.object({
  name: z.string(),
})

export function BlockActions(props: {
  actionsOpen: boolean
  setActionsOpen: Dispatch<SetStateAction<boolean>>
  block: Block
  trigger?: ReactNode
  index: BlockLayerItemProps['index']
  parent: BlockLayerItemProps['parent']
}) {
  const { blockCopy } = useBlockCopy()
  const { blockDelete } = useBlockDelete()
  const { templateAdd } = useTemplateAdd()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
  const { setActive, isActive } = useActive()
  const [blockPickerOpen, setBlockPickerOpen] = useState(false)
  const [blockAddOpen, setBlockAddOpen] = useState(false)
  const [templateAddOpen, setTemplateAddOpen] = useState(false)
  const { setHovered } = useHovered()

  const isActiveBlock = isActive({ store: 'blocks', id: props.block.id })

  const blockAddForm = useForm<z.infer<typeof blockAddSchema>>({
    resolver: zodResolver(blockAddSchema),
    defaultValues: { name: '', edge: 'bottom', component: '' },
  })

  const templateAddForm = useForm<z.infer<typeof templateAddSchema>>({
    resolver: zodResolver(templateAddSchema),
    defaultValues: { name: '' },
  })

  const { blockAdd } = useBlockAdd()
  const context = useRouteContext({ from: '/pages/$id' })

  function disableAdd() {
    try {
      validateSlotMax({ target: { parent: props.parent } })
      return false
    } catch (e) {
      return true
    }
  }

  useEffect(() => {
    if (props.actionsOpen || templateAddOpen || blockAddOpen) {
      setHovered(props.block.id)
    } else {
      setHovered(undefined)
    }
  }, [props.actionsOpen, templateAddOpen, blockAddOpen, props.block])

  return (
    <>
      <DropdownMenu
        open={props.actionsOpen}
        onOpenChange={(bool) => {
          props.setActionsOpen(bool)
        }}
      >
        <DropdownMenuTrigger asChild disabled={isCanvasMutating}>
          {props.trigger ? props.trigger : <MoreHorizontal size={16} className="shrink-0 opacity-40 enabled:hover:opacity-100" />}
        </DropdownMenuTrigger>
        <DropdownMenuContent onClick={(e) => e.stopPropagation()} className="w-56" align="start">
          <DropdownMenuLabel>Layer actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              disabled={disableAdd()}
              className="data-[disabled]:opacity-50"
              onClick={(e) => {
                e.stopPropagation()
                setBlockAddOpen(true)
                props.setActionsOpen(false)
              }}
            >
              <Component size={14} className="opacity-40 mr-2" />
              Add component
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              onClick={(e) => {
                e.stopPropagation()
                setBlockAddOpen(true)
              }}
            >
              <DropdownMenuItem onSelect={() => blockAddForm.setValue('edge', 'bottom')}>Below</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => blockAddForm.setValue('edge', 'top')}>Above</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem
            onClick={() => {
              blockCopy({ index: props.index, id: props.block.id, parent: props.parent })
            }}
          >
            <Copy size={14} className="opacity-40 mr-2" /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              setTemplateAddOpen(true)
            }}
          >
            <Layout size={14} className="opacity-40 mr-2" /> Create template
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              await blockDelete({ index: props.index, blockId: props.block.id, parent: props.parent })
              if (isActiveBlock) setActive(undefined)
            }}
          >
            <Trash size={14} className="opacity-40 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={templateAddOpen}
        onOpenChange={(bool) => {
          templateAddForm.reset()

          setTemplateAddOpen(bool)
        }}
      >
        <DialogContent className="w-96" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Add template</DialogTitle>
            <DialogDescription>Add a new template to your library.</DialogDescription>
          </DialogHeader>

          <Form {...templateAddForm}>
            <form
              onSubmit={templateAddForm.handleSubmit(async (values) => {
                templateAdd({
                  name: values.name.trim() === '' ? undefined : values.name.trim(),
                  source: { id: 'block', index: props.index, node: props.block, parent: props.parent },
                })
                setTemplateAddOpen(false)
              })}
              className="grid gap-4"
            >
              <FormField
                control={templateAddForm.control}
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
              <Button type="submit">Add template</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={blockAddOpen}
        onOpenChange={(bool) => {
          blockAddForm.reset()
          setBlockAddOpen(bool)
        }}
      >
        <DialogContent className="w-96" onClick={(e) => e.stopPropagation()}>
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
                setBlockAddOpen(false)
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
    </>
  )
}
