import { useBlockGet } from '@/hooks/use-block-get'
import { config, Props } from '@/main'
import { useActive } from '@/hooks/use-active'
import { Input } from '../ui/input'
import { useBlockUpdateProps } from '@/hooks/use-block-update-props'

export function PropsPanel(props: { activeId: number }) {
  const { blockGet } = useBlockGet({ id: props.activeId })
  const { blockUpdateProps, blockOptimisic } = useBlockUpdateProps(blockGet.data.id)
  const { setActive } = useActive()
  const block = blockOptimisic ?? blockGet.data

  const configItem = config[block.type]
  const configItemProps = configItem?.props
  if (!configItemProps) return null

  function renderInput(key: keyof Props) {
    switch (configItemProps?.[key].type) {
      case 'text': {
        return (
          <Input
            onChange={(e) => {
              blockUpdateProps({ block, props: { [key]: e.target.value } })
            }}
            defaultValue={block.props[key]}
            type="text"
          />
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
