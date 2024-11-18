import { HTMLInputAutoCompleteAttribute, StrictMode } from 'react'
import { get, getMany, add, update, updateMany, addMany, remove, removeMany, getTree, isPage, isBlock, duplicateTree } from '@/api'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from '@/routeTree.gen'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Block } from '@/db'
import '@/index.css'
import { Toaster } from 'sonner'
import { buttonConfig, headingConfig, containerConfig } from '@repo/blocks'

export const queryClient = new QueryClient()

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

type Common = { id: string; name?: string; description?: string; hidden?: HiddenSchema }

export type StringField = Common & {
  type: 'string'
  config?: { autoComplete?: HTMLInputAutoCompleteAttribute; required?: boolean; minLength?: number; maxLength?: number }
  options?: Array<{ name: string; value: string }>
  default?: string
}

export type ColourField = Common & {
  type: 'colour'
  config?: { readOnly?: boolean }
  options: {
    solid?: Array<{ name?: string; value: string }>
    gradient?: Array<{ name?: string; value: string }>
  }
  default?: string
}

export type NumberField = Common & {
  type: 'number'
  config?: { autoComplete?: HTMLInputAutoCompleteAttribute; required?: boolean; min?: number; max?: number; step?: number }
  default?: number
}

export type BooleanField = Common & { type: 'boolean'; default?: boolean }

export type CollapsibleField = Common & {
  type: 'collapsible'
  props: Array<Field | CollapsibleField>
  config: {
    defaultOpen?: boolean
  }
}

export type GridField = Common & {
  type: 'grid'
  props: Array<Field | CollapsibleField>
  cols?: 1 | 2 | 3
}

export type Field = StringField | ColourField | NumberField | BooleanField | CollapsibleField | GridField

export type Props = Array<Field>

export type Config = {
  [key: string]: {
    component: (props: any) => JSX.Element
    name: string
    folder?: Array<string>
    deprecated?: boolean
    slots?: {
      [key: string]: {
        default?: Array<Block['id']>
        name: string
        validation?: {
          disabledComponents?: Array<string>
          maxItems?: number
        }
      }
    }
    props?: Props
  }
}

export const config: Config = {
  ...buttonConfig,
  ...headingConfig,
  ...containerConfig,
}

export type Context = typeof context

export const context = {
  get,
  getMany,
  getTree,
  duplicateTree,
  isBlock,
  isPage,
  add,
  addMany,
  update,
  updateMany,
  remove,
  removeMany,
  config,
  queryClient,
} as const

export const router = createRouter({ routeTree, context })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <Toaster />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <TanStackRouterDevtools initialIsOpen={false} router={router} />
        <ReactQueryDevtools initialIsOpen={false} client={queryClient} />
      </QueryClientProvider>
    </StrictMode>,
  )
}
