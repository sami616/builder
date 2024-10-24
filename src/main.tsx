import { buttonConfig, headingConfig, containerConfig } from '@/components/blocks'
import { StrictMode } from 'react'
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

const queryClient = new QueryClient()

export type PropTypes = {
  text: string
  number: number
  select: Array<{ name: string; value: string }>
  switch: boolean
}

// Define a union type for PropItems, where type and default must match
export type PropItem =
  | { name: string; type: 'text'; default?: string }
  | { name: string; type: 'number'; default?: number }
  | { name: string; type: 'select'; default?: Array<{ name: string; value: string }> }
  | { name: string; type: 'switch'; default?: boolean }

// Props can have any key, but each value must be a PropItem (with type-default enforcement)
export type Props = {
  [key: string]: PropItem
}

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

const context = {
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
