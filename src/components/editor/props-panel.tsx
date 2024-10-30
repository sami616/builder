import { useBlockGet } from '@/hooks/use-block-get'
import { config, Props } from '@/main'
// import { useActive } from '@/hooks/use-active'
import { Input } from '../ui/input'
import { useBlockUpdateProps } from '@/hooks/use-block-update-props'
import { Button } from '../ui/button'
import { Check, Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Label } from '../ui/label'
import { useIsMutating } from '@tanstack/react-query'
import { Select, SelectContent, SelectGroup, SelectItem, SelectValue, SelectTrigger } from '../ui/select'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

export function PropsPanel(props: { activeId: number }) {
  const { blockGet } = useBlockGet({ id: props.activeId })
  const { blockUpdateProps } = useBlockUpdateProps()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
  const block = blockGet.data
  const [propState, setPropState] = useState<Record<string, any>>(block.props)

  const configItem = config[block.type]
  const configItemProps = configItem.props
  if (!configItemProps) return null

  useEffect(() => {
    setPropState(block.props)
  }, [block])

  function renderInput(key: string) {
    switch (configItemProps?.[key].type) {
      case 'string': {
        const prop = configItemProps[key]
        const { options } = prop
        if (!options) {
          return (
            <div className="gap-2 grid p-2">
              <PropLabel prop={prop} key={key} />
              <div className="flex gap-2">
                <Input
                  id={key}
                  disabled={isCanvasMutating}
                  onChange={(e) => {
                    setPropState({ ...propState, [key]: e.target.value })
                  }}
                  value={propState[key]}
                  type="text"
                />
                <Button
                  disabled={isCanvasMutating}
                  size="icon"
                  variant="ghost"
                  onClick={() => blockUpdateProps({ block, props: { [key]: propState[key] } })}
                >
                  <Check size={16} />
                </Button>
              </div>
            </div>
          )
        }

        return (
          <div className="gap-2 grid p-2">
            <PropLabel prop={prop} key={key} />
            <div className="flex gap-2">
              <Select
                value={propState[key]}
                onValueChange={(val) => {
                  blockUpdateProps({ block, props: { [key]: val } })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent id={key}>
                  <SelectGroup>
                    {options.map((opt) => {
                      return <SelectItem value={opt.value}>{opt.name}</SelectItem>
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      }
      case 'number': {
        const prop = configItemProps[key]
        const { options } = prop
        if (!options) {
          return (
            <div className="gap-2 grid p-2">
              <PropLabel prop={prop} key={key} />
              <div className="flex gap-2">
                <Input
                  id={key}
                  disabled={isCanvasMutating}
                  onChange={(e) => {
                    setPropState({ ...propState, [key]: Number(e.target.value) })
                  }}
                  value={propState[key]}
                  type="number"
                />
                <Button
                  disabled={isCanvasMutating}
                  size="icon"
                  variant="ghost"
                  onClick={() => blockUpdateProps({ block, props: { [key]: Number(propState[key]) } })}
                >
                  <Check size={16} />
                </Button>
              </div>
            </div>
          )
        }

        return (
          <div className="gap-2 grid p-2">
            <PropLabel prop={prop} key={key} />
            <div className="flex gap-2">
              <Select
                value={propState[key]}
                onValueChange={(val) => {
                  blockUpdateProps({ block, props: { [key]: Number(val) } })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent id={key}>
                  <SelectGroup>
                    {options.map((opt) => {
                      return <SelectItem value={String(opt.value)}>{opt.name}</SelectItem>
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      }
    }
  }

  return (
    <div data-component="PropsPanel" className="px-2">
      {/* <button onClick={() => setActive(undefined)}>Close</button> */}
      <h4 className="font-medium text-sm p-2">{block.name} props</h4>
      {Object.keys(configItemProps).map((key) => {
        return <div key={key}>{renderInput(key)}</div>
      })}
    </div>
  )
}

export function PropLabel(props: { prop: Props[keyof Props]; key: string }) {
  return (
    <Label htmlFor={props.key} className="flex gap-2 items-center">
      {props.prop.name}
      {props.prop.description && (
        <HoverCard>
          <HoverCardTrigger>
            <Info size={14} className="stroke-gray-500" />
          </HoverCardTrigger>
          <HoverCardContent>
            <p className="text-sm">{props.prop.description}</p>
          </HoverCardContent>
        </HoverCard>
      )}
    </Label>
  )
}
