import { useBlockGet } from '@/hooks/use-block-get'
import { config } from '@/main'
import { useActive } from '@/hooks/use-active'
import { Input } from '../ui/input'
import { useBlockUpdateProps } from '@/hooks/use-block-update-props'
import { Button } from '../ui/button'
import { Save } from 'lucide-react'
import { useState } from 'react'
import { Label } from '../ui/label'

export function PropsPanel(props: { activeId: number }) {
  const { blockGet } = useBlockGet({ id: props.activeId })
  const { blockUpdateProps } = useBlockUpdateProps()
  const { setActive } = useActive()
  const [propState, setPropState] = useState<Record<string, any>>({})
  const block = blockGet.data

  const configItem = config[block.type]
  const configItemProps = configItem?.props
  if (!configItemProps) return null

  function renderInput(key: string) {
    switch (configItemProps?.[key].type) {
      case 'text': {
        return (
          <div className="gap-2 grid">
            <Label>{configItemProps?.[key].name}</Label>
            <div className="flex gap-2">
              <Input
                onChange={(e) => {
                  setPropState({ ...propState, [key]: e.target.value })
                }}
                defaultValue={block.props[key]}
                type="text"
              />
              <Button size="icon" onClick={() => blockUpdateProps({ block, props: { [key]: propState[key] } })}>
                <Save size={16} />
              </Button>
            </div>
          </div>
        )
      }
      case 'number': {
        const defaultValue = configItemProps[key].default
        return <Input defaultValue={defaultValue} type="number" />
      }
    }
  }

  return (
    <div data-component="PropsPanel">
      <button onClick={() => setActive(undefined)}>Close</button>
      {Object.keys(configItemProps).map((key) => {
        return <div>{renderInput(key)}</div>
      })}
    </div>
  )
}
