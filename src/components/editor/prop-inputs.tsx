import { Config } from '@/main'
import { Block } from '@/db'
import { useBlockGet } from '@/hooks/use-block-get'
import { PropInputString } from './prop-input-string'
import { PropInputNumber } from './prop-input-number'

export function PropInputs(props: { activeBlockId: Block['id']; configItemPropsKey: string; configItemProps: Config[keyof Config]['props'] }) {
  const { blockGet } = useBlockGet({ id: props.activeBlockId })
  const configItemProps = props.configItemProps
  const key = props.configItemPropsKey

  if (!configItemProps) return null

  switch (configItemProps[key].type) {
    case 'string': {
      const prop = configItemProps[key]
      return <PropInputString key={blockGet.data.id} block={blockGet.data} propKey={key} prop={prop} />
    }
    case 'number': {
      const prop = configItemProps[key]
      return <PropInputNumber key={blockGet.data.id} block={blockGet.data} propKey={key} prop={prop} />
    }
    case 'object': {
      const props = configItemProps[key]
      return <pre>{JSON.stringify(props, null, 2)}</pre>
    }
  }
}
