import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Check, Info } from 'lucide-react'
import { Label } from '../ui/label'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { useBlockUpdateProps } from '@/hooks/use-block-update-props'
import { Config, Props } from '@/main'
import { useIsMutating } from '@tanstack/react-query'
import { Block } from '@/db'
import { useBlockGet } from '@/hooks/use-block-get'
import { PropsInputString } from './props-input-string'

export function PropsInputs(props: { activeBlockId: Block['id']; configItemPropsKey: string; configItemProps: Config[keyof Config]['props'] }) {
  const { blockGet } = useBlockGet({ id: props.activeBlockId })
  const { blockUpdateProps } = useBlockUpdateProps()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
  const configItemProps = props.configItemProps
  const key = props.configItemPropsKey

  if (!configItemProps) return null

  switch (configItemProps[key].type) {
    case 'string': {
      const prop = configItemProps[key]
      return <PropsInputString key={blockGet.data.id} block={blockGet.data} propKey={key} prop={prop} />
    }
    case 'number': {
      const prop = configItemProps[key]
      return (
        <form
          key={blockGet.data.id}
          className="gap-2 grid p-2"
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            blockUpdateProps({ block: blockGet.data, props: { [key]: formData.get(key) } })
          }}
        >
          <InputLabel prop={prop} propKey={key} />
          <div className="flex gap-2">
            <Input name={key} id={key} disabled={isCanvasMutating} {...prop.config} defaultValue={blockGet.data.props[key]} type="number" />
            <Button type="submit" disabled={isCanvasMutating} size="icon" variant="ghost">
              <Check size={16} />
            </Button>
          </div>
        </form>
      )
    }
    case 'object': {
      const props = configItemProps[key]
      return <pre>{JSON.stringify(props, null, 2)}</pre>
    }
  }
}

export function InputLabel(props: { prop: Props[keyof Props]; propKey: string }) {
  return (
    <Label htmlFor={props.propKey} className="flex gap-2 items-center">
      {props.prop.name}
      {props.prop.description && (
        <HoverCard>
          <HoverCardTrigger>
            <Info size={14} className="stroke-gray-500" />
          </HoverCardTrigger>
          <HoverCardContent>
            <p className="text-xs">{props.prop.description}</p>
          </HoverCardContent>
        </HoverCard>
      )}
    </Label>
  )
}
