import { type HTMLInputAutoCompleteAttribute } from 'react'

export type SocketTo = {
  Server: {
    checkPublishStatus: () => void
    pagePublish: (data: ResolvedDBStores['Page']) => void
  }
  Client: {
    checkPublishStatus: (data: Array<number>) => void
    pagePublish: (data: ResolvedDBStores['Page']) => void
  }
}

export type ResolvedDBStores = {
  Page: Omit<DBStores['Page'], 'slots'> & { slots: Record<string, Array<ResolvedDBStores['Block']>> }
  Block: Omit<DBStores['Block'], 'slots'> & { slots: Record<string, Array<ResolvedDBStores['Block']>> }
}

export type DBStores = {
  Page: {
    id: number
    createdAt: Date
    updatedAt: Date
    store: 'pages'
    title: string
    slug: string
    url: string
    description: string
    status: 'Published' | 'Unpublished'
    publishedAt?: Date
    slots: { [index: string]: Array<DBStores['Block']['id']> }
  }
  Block: {
    id: number
    createdAt: Date
    updatedAt: Date
    store: 'blocks'
    type: string
    name: string
    slots: { [index: string]: Array<DBStores['Block']['id']> }
    props: { [index: string]: any }
  }
  Template: {
    id: number
    createdAt: Date
    updatedAt: Date
    store: 'templates'
    order: number
    name: string
    rootNode: DBStores['Block']
    slots: { [index: string]: Array<DBStores['Block']['id']> }
  }
}

export const is = {
  block: (args: any): args is DBStores['Block'] => {
    return args.store === 'blocks'
  },
  template: (args: any): args is DBStores['Template'] => {
    return args.store === 'templates'
  },
  page: (args: any): args is DBStores['Page'] => {
    return args.store === 'pages'
  },
}

export type Hidden = { operator: '&&' | '||'; rules: Array<[string, '===' | '!==' | '>' | '<' | '>=' | '<=', string | number | boolean]> }

export type ConfigProps = {
  Grid: {
    id: string
    name?: string
    description?: string
    hidden?: Hidden
    type: 'grid'
    props: Config[keyof Config]['props']
    cols?: 1 | 2 | 3
  }
  Collapsible: {
    id: string
    name?: string
    description?: string
    hidden?: Hidden
    type: 'collapsible'
    props: Config[keyof Config]['props']
    config: {
      defaultOpen?: boolean
    }
  }
  Number: {
    id: string
    name?: string
    description?: string
    hidden?: Hidden
    type: 'number'
    config?: { autoComplete?: HTMLInputAutoCompleteAttribute; required?: boolean; min?: number; max?: number; step?: number }
    default?: number
  }
  Boolean: {
    id: string
    name?: string
    description?: string
    hidden?: Hidden
    type: 'boolean'
    default?: boolean
  }
  Color: {
    id: string
    name?: string
    description?: string
    hidden?: Hidden
    type: 'colour'
    config?: { readOnly?: boolean }
    options: {
      solid?: Array<{ name?: string; value: string }>
      gradient?: Array<{ name?: string; value: string }>
    }
    default?: string
  }
  String: {
    id: string
    name?: string
    description?: string
    hidden?: Hidden
    type: 'string'
    config?: { autoComplete?: HTMLInputAutoCompleteAttribute; required?: boolean; minLength?: number; maxLength?: number }
    options?: Array<{ name: string; value: string }>
    default?: string
  }
}

export type Config = {
  [key: string]: {
    component: (props: any) => JSX.Element
    name: string
    folder?: Array<string>
    deprecated?: boolean
    slots?: {
      [key: string]: {
        default?: Array<DBStores['Block']['id']>
        name: string
        validation?: {
          disabledComponents?: Array<string>
          maxItems?: number
        }
      }
    }
    props?: Array<ConfigProps[keyof ConfigProps]>
  }
}

export function evaluateCondition(props: DBStores['Block']['props'], hidden?: Hidden) {
  if (!hidden) return false
  if (hidden.operator === '&&') {
    return hidden.rules.every((rule) => evaluateRule(rule, props))
  } else if (hidden.operator === '||') {
    return hidden.rules.some((rule) => evaluateRule(rule, props))
  }
}

function evaluateRule(rule: Hidden['rules'][number], props: DBStores['Block']['props']) {
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
