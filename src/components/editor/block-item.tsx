import { useDeferredValue, useRef, useState } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBlockHover } from '@/hooks/use-block-hover'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { DropIndicator } from '@/components/editor/drop-indicator'
import { type Block, type Page } from '@/db'
import { useRouteContext } from '@tanstack/react-router'
import { DragPreview } from '@/components/editor/drag-preview'
import { useDrag, isDragData } from '@/hooks/use-drag'
import { useTemplateApply } from '@/hooks/use-template-apply'
import { useBlockGet } from '@/hooks/use-block-get'
import { useBlockAdd } from '@/hooks/use-block-add'
import { useDrop } from '@/hooks/use-drop'
import { useBlockMove } from '@/hooks/use-block-move'
import { Missing } from '@/components/editor/missing'
import clsx from 'clsx'
import { useActive } from '@/hooks/use-active'
import { toast } from 'sonner'
import { validateSlotBlock, validateSlotMax } from './block-layer-item-slot'
import { Check, ChevronsUpDown, Copy, Layout, Plus, Trash } from 'lucide-react'
import { PopoverContent, PopoverTrigger, Popover } from '../ui/popover'
import {
  ContextMenu,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { useBlockCopy } from '@/hooks/use-block-copy'
import { useBlockDelete } from '@/hooks/use-block-delete'
import { useTemplateAdd } from '@/hooks/use-template-add'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'

const blockAddSchema = z.object({
  name: z.string(),
  edge: z.union([z.literal('top'), z.literal('bottom')]),
  component: z.string(),
})

const templateAddSchema = z.object({
  name: z.string(),
})

export function BlockItem(props: { index: number; page: Page; parent: { slot: string; node: Block | Page }; blockId: Block['id'] }) {
  const { blockGet } = useBlockGet({ id: props.blockId })
  const block = blockGet.data
  const componentProps = block.props
  const { blockAdd } = useBlockAdd()
  const { blockMove } = useBlockMove()
  const { templateApply } = useTemplateApply()
  const { setActive, isActive, handleActiveClick } = useActive()
  const dropRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const context = useRouteContext({ from: '/pages/$id' })
  const isActiveBlock = isActive({ ...block, meta: { index: props.index, parent: props.parent } })
  const { blockCopy } = useBlockCopy()
  const { blockDelete } = useBlockDelete()
  const { templateAdd } = useTemplateAdd()
  const [actionsOpen, setActionsOpen] = useState(false)
  const [blockAddOpen, setBlockAddOpen] = useState(false)
  const [templateAddOpen, setTemplateAddOpen] = useState(false)
  const [blockPickerOpen, setBlockPickerOpen] = useState(false)

  const { setHover, removeHover } = useBlockHover(block.id, dropRef)

  const blockAddForm = useForm<z.infer<typeof blockAddSchema>>({
    resolver: zodResolver(blockAddSchema),
    defaultValues: { name: '', edge: 'bottom', component: '' },
  })

  const templateAddForm = useForm<z.infer<typeof templateAddSchema>>({
    resolver: zodResolver(templateAddSchema),
    defaultValues: { name: '' },
  })

  const { closestEdge } = useDrop({
    dropRef: dropRef,
    data: { index: props.index, parent: props.parent, node: block },
    onDrop: ({ source, target }) => {
      try {
        validateSlotMax({ source, target: target.data })
        validateSlotBlock({ source, target: target.data })
      } catch (e) {
        if (e instanceof Error) toast.error(e.message, { richColors: true })
        return
      }

      if (isDragData['component'](source.data)) {
        blockAdd({ source: source.data, target: target.data })
      }
      if (isDragData['template'](source.data)) {
        templateApply({ source: source.data, target: target.data })
      }
      if (isDragData['block'](source.data)) {
        blockMove({ source: source.data, target: target.data })
      }
    },
  })

  const { isDraggingSource, dragPreviewContainer } = useDrag({
    dragRef,
    data: { id: 'block', index: props.index, parent: props.parent, node: block },
  })

  const componentBlocks = Object.keys(block.slots).reduce<{
    [key: string]: JSX.Element[] | JSX.Element
  }>((acc, slot) => {
    acc[slot] = block.slots[slot].map((blockId, index) => {
      return <BlockItem index={index} parent={{ slot, node: block }} page={props.page} key={blockId} blockId={blockId} />
    })

    return acc
  }, {})

  const deferredComponentBlocks = useDeferredValue(componentBlocks)

  const isMissing = context.config[block.type] ? false : true
  const Component = context.config[block.type]?.component ?? (() => <Missing node={{ type: 'component', name: block.type }} />)

  function disableAdd() {
    try {
      validateSlotMax({ target: { parent: props.parent } })
      return false
    } catch (e) {
      return true
    }
  }

  return (
    <>
      <ContextMenu
        onOpenChange={(bool) => {
          setActionsOpen(bool)
          if (bool) {
            setActive([{ ...block, meta: { index: props.index, parent: props.parent } }])
          } else {
            setActive([])
          }
        }}
      >
        <ContextMenuTrigger asChild>
          <div
            data-component="BlockItem"
            className={clsx([
              'relative',
              'outline',
              'outline-2',
              '-outline-offset-2',
              'outline-none',
              isDraggingSource && 'opacity-50',
              isActiveBlock && 'outline-rose-500 hover:outline-rose-600',
            ])}
            data-drop-id={`block-${blockGet.data.id}`}
            onClick={(e) => {
              e.stopPropagation()
              handleActiveClick({ metaKey: e.metaKey, node: { ...block, meta: { index: props.index, parent: props.parent } } })
            }}
            onMouseOver={(e) => {
              e.stopPropagation()
              if (actionsOpen || templateAddOpen || blockAddOpen) return
              setHover()
            }}
            onMouseOut={(e) => {
              e.stopPropagation()
              if (actionsOpen || templateAddOpen || blockAddOpen) return
              removeHover()
            }}
            ref={dropRef}
          >
            <div ref={dragRef} className="group">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  blockAddForm.setValue('edge', 'top')
                  setBlockAddOpen(true)
                }}
                className={clsx([
                  'size-5',
                  'items-center',
                  'justify-center',
                  'origin-top',
                  'z-50',
                  'absolute',
                  'top-0',
                  '-ml-2.5',
                  'left-1/2',
                  'scale-50',
                  'transition',
                  'hover:scale-100',
                  'hidden',
                  'group-hover:flex',
                  isActiveBlock ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600',
                ])}
              >
                <Plus size={14} className="stroke-white" />
              </button>

              <Component {...componentProps} {...deferredComponentBlocks} />

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  blockAddForm.setValue('edge', 'bottom')
                  setBlockAddOpen(true)
                }}
                className={clsx([
                  'size-5',
                  'items-center',
                  'justify-center',
                  'absolute',
                  'bottom-0',
                  'z-50',
                  'left-1/2',
                  'origin-bottom',
                  '-ml-2.5',
                  'scale-50',
                  'transition',
                  'hover:scale-100',
                  'hidden',
                  'group-hover:flex',
                  isActiveBlock ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600',
                ])}
              >
                <Plus size={14} className="stroke-white" />
              </button>
              <DropIndicator closestEdge={closestEdge} variant="horizontal" />
              <DragPreview dragPreviewContainer={dragPreviewContainer}>{block.name}</DragPreview>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent
          onClick={(e) => e.stopPropagation()}
          onMouseOut={(e) => e.stopPropagation()}
          onMouseOver={(e) => e.stopPropagation()}
          className="w-56"
        >
          <ContextMenuLabel>Layer actions</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => {
              setBlockAddOpen(true)
            }}
            disabled={disableAdd()}
          >
            <Plus size={14} className="mr-2 stroke-gray-400" /> Add component
          </ContextMenuItem>
          {!isMissing && (
            <ContextMenuItem
              onClick={() => {
                blockCopy({ index: props.index, id: block.id, parent: props.parent })
              }}
            >
              <Copy size={14} className="mr-2 stroke-gray-400" />
              Duplicate
            </ContextMenuItem>
          )}

          {!isMissing && (
            <ContextMenuItem
              onClick={() => {
                setTemplateAddOpen(true)
              }}
            >
              <Layout size={14} className="mr-2 stroke-gray-400" />
              Create template
            </ContextMenuItem>
          )}
          <ContextMenuItem
            onClick={async () => {
              await blockDelete({ index: props.index, blockId: block.id, parent: props.parent })
              if (isActiveBlock) setActive([])
            }}
            className="text-red-500"
          >
            <Trash size={14} className="mr-2" /> Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <Dialog
        open={blockAddOpen}
        onOpenChange={(bool) => {
          blockAddForm.reset()
          setBlockAddOpen(bool)
        }}
      >
        <DialogContent
          onClick={(e) => e.stopPropagation()}
          onMouseOut={(e) => e.stopPropagation()}
          onMouseOver={(e) => e.stopPropagation()}
          className="w-96"
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
      <Dialog
        open={templateAddOpen}
        onOpenChange={(bool) => {
          templateAddForm.reset()
          setTemplateAddOpen(bool)
        }}
      >
        <DialogContent
          onClick={(e) => e.stopPropagation()}
          onMouseOut={(e) => e.stopPropagation()}
          onMouseOver={(e) => e.stopPropagation()}
          className="w-96"
        >
          <DialogHeader>
            <DialogTitle>Add template</DialogTitle>
            <DialogDescription>Add a new template to your library.</DialogDescription>
          </DialogHeader>

          <Form {...templateAddForm}>
            <form
              onSubmit={templateAddForm.handleSubmit(async (values) => {
                templateAdd({
                  name: values.name.trim() === '' ? undefined : values.name.trim(),
                  source: { id: 'block', index: props.index, node: block, parent: props.parent },
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
    </>
  )
}
