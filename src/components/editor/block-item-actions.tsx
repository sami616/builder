import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useBlockCopy } from '@/hooks/use-block-copy'
import { useBlockDelete } from '@/hooks/use-block-delete'
import { useTemplateAdd } from '@/hooks/use-template-add'
import clsx from 'clsx'
import { Trash, Copy, Layout, Plus, ChevronsUpDown, Check } from 'lucide-react'
import { ComponentProps, Dispatch, RefObject, SetStateAction, useState } from 'react'
import { BlockItem } from './block-item'
import { Block } from '@/db'
import { useActive } from '@/hooks/use-active'
import { useBlockAdd } from '@/hooks/use-block-add'
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from '@/components/ui/popover'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import { Button } from '../ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'
import { cn } from '@/lib/utils'
import { useRouteContext } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { BlockLayerItemActions } from './block-layer-item-actions'

type BlockItemProps = ComponentProps<typeof BlockItem>

const formSchema = z.object({
  edge: z.union([z.literal('top'), z.literal('bottom')]),
  component: z.string(),
})

export function BlockItemActions(props: {
  popoverRef: RefObject<HTMLDivElement>
  addBlockOpen: boolean
  setAddBlockOpen: Dispatch<SetStateAction<boolean>>
  index: BlockItemProps['index']
  parent: BlockItemProps['parent']
  block: Block
}) {
  const { blockCopy } = useBlockCopy()
  const { blockDelete } = useBlockDelete()
  const { templateAdd } = useTemplateAdd()
  const { blockAdd } = useBlockAdd()
  const { setActive, isActive } = useActive()

  const isActiveBlock = isActive({store:'blocks', id:props.block.id})
  const blockActionStyles = clsx(['cursor-grab p-2', isActiveBlock ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'])
  const [blockListOpen, setBlockListOpen] = useState(false)
  const context = useRouteContext({ from: '/pages/$id' })
  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { edge: 'bottom', component: '' } })

  return (
    <Popover modal open={props.addBlockOpen} onOpenChange={props.setAddBlockOpen}>
      <PopoverAnchor>
        <div
          // @ts-ignore
          style={{ positionAnchor: `--${props.block.id}` }}
          className={clsx([
            'rounded-tr rounded-tl p-0 inset-auto bottom-[anchor(top)] right-[anchor(right)]',
            isActiveBlock ? 'bg-rose-500' : 'bg-emerald-500',
          ])}
          popover="true"
          ref={props.popoverRef}
        >

          <TooltipProvider>
            <div className="flex">
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <button
                      className={blockActionStyles}
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      <Plus size={16} className="stroke-white" />
                    </button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <PopoverContent alignOffset={5} sideOffset={5} onClick={(e) => e.stopPropagation()} align="end">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(async (values) => {
                        blockAdd({
                          source: {
                            id: 'componentItem',
                            type: values.component,
                          },
                          target: {
                            edge: values.edge,
                            parent: props.parent,
                            index: props.index,
                          },
                        })
                        props.setAddBlockOpen(false)
                        form.reset()
                      })}
                      className="grid gap-2"
                    >
                      <FormField
                        control={form.control}
                        name="edge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Placement</FormLabel>
                            <FormControl>
                              <ToggleGroup size="sm" value={field.value} onValueChange={field.onChange} type="single">
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
                        control={form.control}
                        name="component"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Component</FormLabel>
                            <FormControl>
                              <Popover open={blockListOpen} onOpenChange={setBlockListOpen}>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" role="combobox" aria-expanded={blockListOpen} className="w-full justify-between">
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
                                          return (
                                            <CommandItem
                                              key={key}
                                              value={key}
                                              onSelect={(args) => {
                                                setBlockListOpen(false)
                                                field.onChange(args)
                                              }}
                                            >
                                              <Check className={cn('mr-2 size-4', field.value === key ? 'opacity-100' : 'opacity-0')} />
                                              {configItem.name}
                                            </CommandItem>
                                          )
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
                      <Button type="submit">Add component</Button>
                    </form>
                  </Form>
                </PopoverContent>
                <TooltipContent>
                  <p>Add component</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={blockActionStyles}
                    onClick={(e) => {
                      e.stopPropagation()
                      blockCopy({ index: props.index, id: props.block.id, parent: props.parent })
                    }}
                  >
                    <Copy size={16} className="stroke-white" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Duplicate layer</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={blockActionStyles}
                    onClick={(e) => {
                      e.stopPropagation()
                      templateAdd({ source: { id: 'block', index: props.index, node: props.block, parent: props.parent } })
                    }}
                  >
                    <Layout size={16} className="stroke-white" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create template</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={blockActionStyles}
                    onClick={(e) => {
                      e.stopPropagation()
                      blockDelete({
                        index: props.index,
                        blockId: props.block.id,
                        parent: props.parent,
                      })
                      setActive(undefined)
                    }}
                  >
                    <Trash size={16} className="stroke-white" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete layer</p>
                </TooltipContent>
              </Tooltip>



          <button className={blockActionStyles} onClick={(e) => e.stopPropagation()}>
            <BlockLayerItemActions index={props.index} parent={props.parent} key={props.block.id} block={props.block} />
          </button>

            </div>
          </TooltipProvider>
        </div>
      </PopoverAnchor>
    </Popover>
  )
}
