import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Block } from '@/db'
import { cn } from '@/lib/utils'
import { ColourField } from '@/main'
import { Copy, Paintbrush } from 'lucide-react'
import { PropInputLabel } from './prop-input-label'
import { useId } from 'react'
import { useBlockUpdateProps } from '@/hooks/use-block-update-props'
import { useIsMutating } from '@tanstack/react-query'
import { TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip'
import { Tooltip, TooltipContent } from '../ui/tooltip'
import { toast } from 'sonner'

export function PropInputColour(props: { block: Block; field: ColourField }) {
  const value = props.block.props[props.field.id]
  const defaultTab = value?.includes?.('gradient') ? 'gradient' : 'solid'
  const { blockUpdateProps } = useBlockUpdateProps()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
  const { options } = props.field
  const id = useId()

  const name =
    defaultTab === 'gradient'
      ? options.gradient?.find((item) => item.value === value)?.name
      : options.solid?.find((item) => item.value === value)?.name

  return (
    <div className="gap-2 grid">
      <PropInputLabel field={props.field} for={id} />
      <Popover>
        <PopoverTrigger disabled={isCanvasMutating} asChild>
          <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !value && 'text-muted-foreground')}>
            <div className="w-full flex items-center gap-2">
              {value ? (
                <div className="h-4 w-4 rounded !bg-center !bg-cover transition-all" style={{ background: value }}></div>
              ) : (
                <Paintbrush className="h-4 w-4" />
              )}
              <div className="text-sm truncate flex-1">{value ? (name ?? value) : 'Pick a color'}</div>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="grid gap-4">
          <Tabs defaultValue={defaultTab} className="w-full">
            {options.solid && options.gradient && (
              <TabsList className="w-full">
                {options.solid && (
                  <TabsTrigger className="flex-1" value="solid">
                    Colours
                  </TabsTrigger>
                )}
                {options.gradient && (
                  <TabsTrigger className="flex-1" value="gradient">
                    Gradients
                  </TabsTrigger>
                )}
              </TabsList>
            )}

            {options.solid && (
              <TabsContent value="solid" className="flex flex-wrap gap-1">
                {options.solid?.map((solid) => (
                  <TooltipProvider key={solid.value}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          key={solid.value}
                          style={{ background: solid.value }}
                          className="rounded-md h-6 w-6 cursor-pointer active:scale-105"
                          onClick={() => blockUpdateProps({ block: props.block, props: { [props.field.id]: solid.value } })}
                        />
                      </TooltipTrigger>
                      {solid.name && <TooltipContent>{solid.name}</TooltipContent>}
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </TabsContent>
            )}

            {options.gradient && (
              <TabsContent value="gradient">
                <div className="flex flex-wrap gap-1 mb-2">
                  {options.gradient?.map((gradeint) => (
                    <TooltipProvider key={gradeint.value}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            key={gradeint.value}
                            style={{ background: gradeint.value }}
                            className="rounded-md h-6 w-6 cursor-pointer active:scale-105"
                            onClick={() => blockUpdateProps({ block: props.block, props: { [props.field.id]: gradeint.value } })}
                          />
                        </TooltipTrigger>
                        {gradeint.name && <TooltipContent>{gradeint.name}</TooltipContent>}
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>

          <div className="flex gap-2">
            <Input className="grow-1" readOnly value={value} />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={async () => {
                      await navigator.clipboard.writeText(value)
                      toast.success('Copied to clipboard')
                    }}
                    variant="outline"
                    size="icon"
                  >
                    <Copy size={16} className="stroke-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy to clipboard</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
