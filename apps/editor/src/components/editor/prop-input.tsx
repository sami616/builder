import { type CollapsibleFieldProps, PropCollapsible } from '#components/editor/prop-collapsible.tsx'
import { type BooleanFieldProps, PropInputBoolean } from '#components/editor/prop-input-boolean.tsx'
import { type ColourFieldProps, PropInputColour } from '#components/editor/prop-input-colour.tsx'
import { type NumberFieldProps, PropInputNumber } from '#components/editor/prop-input-number.tsx'
import { type StringFieldProps, PropInputString } from '#components/editor/prop-input-string.tsx'
import { type Block } from '#db.ts'
import { useBlockGet } from '#hooks/use-block-get.ts'
import { type Config } from '#main.tsx'
import { useDeferredValue } from 'react'
import { type GridFieldProps } from './prop-grid'

export function PropInput(props: { activeBlockId: Block['id']; field: Field; configItemProps: Config[keyof Config]['props'] }) {
  const { blockGet } = useBlockGet({ id: props.activeBlockId })
  const deferredBlock = useDeferredValue(blockGet.data)
  switch (props.field.type) {
    case 'string': {
      return <PropInputString key={deferredBlock.id} block={deferredBlock} field={props.field} />
    }
    case 'colour': {
      return <PropInputColour key={deferredBlock.id} block={deferredBlock} field={props.field} />
    }
    case 'number': {
      return <PropInputNumber key={deferredBlock.id} block={deferredBlock} field={props.field} />
    }
    case 'boolean': {
      return <PropInputBoolean key={deferredBlock.id} block={deferredBlock} field={props.field} />
    }
    case 'collapsible': {
      return <PropCollapsible key={deferredBlock.id} block={deferredBlock} field={props.field} />
    }
  }
}

export function evaluateRule(rule: HiddenSchema['rules'][number], props: Block['props']) {
  const [propertyID, operator, propertyValue] = rule

  const actualValue = props[propertyID]

  switch (operator) {
    case '===': {
      switch (propertyValue) {
        case 'undefined':
          return actualValue === undefined
        case 'null':
          return actualValue === null
        default:
          return actualValue === propertyValue
      }
    }
    case '!==':
      switch (propertyValue) {
        case 'undefined':
          return actualValue !== undefined

        case 'null':
          return actualValue !== null
        default:
          return actualValue !== propertyValue
      }
    case '>':
      switch (typeof actualValue) {
        case 'number': {
          if (typeof propertyValue !== 'number') return false
          return actualValue > propertyValue
        }
        default: {
          if (actualValue?.length) {
            return actualValue.length > propertyValue
          }
          return false
        }
      }
    case '<':
      switch (typeof actualValue) {
        case 'number': {
          if (typeof propertyValue !== 'number') return false
          return actualValue < propertyValue
        }
        default: {
          if (actualValue?.length) {
            return actualValue.length < propertyValue
          }
          return false
        }
      }
    case '>=':
      switch (typeof actualValue) {
        case 'number': {
          if (typeof propertyValue !== 'number') return false
          return actualValue >= propertyValue
        }
        default: {
          if (actualValue?.length) {
            return actualValue.length >= propertyValue
          }
          return false
        }
      }
    case '<=':
      switch (typeof actualValue) {
        case 'number': {
          if (typeof propertyValue !== 'number') return false
          return actualValue <= propertyValue
        }
        default: {
          if (actualValue?.length) {
            return actualValue.length <= propertyValue
          }
          return false
        }
      }
  }
}

export function evaluateCondition(props: Block['props'], hidden?: HiddenSchema) {
  if (!hidden) return false
  if (hidden.operator === '&&') {
    return hidden.rules.every((rule) => evaluateRule(rule, props))
  } else if (hidden.operator === '||') {
    return hidden.rules.some((rule) => evaluateRule(rule, props))
  }
}

export type HiddenSchema = {
  operator: '&&' | '||'
  rules: Array<[string, '===' | '!==' | '>' | '<' | '>=' | '<=', string | number | boolean]>
}

export type CommonFieldProps = { id: string; name?: string; description?: string; hidden?: HiddenSchema }

export type Field = StringFieldProps | ColourFieldProps | NumberFieldProps | BooleanFieldProps | CollapsibleFieldProps | GridFieldProps
