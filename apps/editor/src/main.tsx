import { add, addMany, duplicateTree, get, getMany, getTree, isBlock, isPage, remove, removeMany, update, updateMany } from '#api.ts'
import { Field } from '#components/editor/prop-input.tsx'
import { Block } from '#db.ts'
import '#index.css'
import { routeTree } from '#routeTree.gen.ts'
import { buttonConfig, containerConfig, headingConfig } from '@repo/blocks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'sonner'

export const queryClient = new QueryClient()

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
