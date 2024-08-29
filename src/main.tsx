import * as components from './components'
import { StrictMode } from 'react'
import {
  addBlock,
  addExperience,
  deleteBlocksRecursivley,
  deleteExperience,
  getBlock,
  getExperience,
  getExperiences,
  updateBlock,
  updateExperience,
} from './api'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Context } from '@dnd-kit/sortable/dist/components'
import { Block } from './db'

const queryClient = new QueryClient()

type Config = {
  [key: string]: {
    component: (props: any) => JSX.Element
    name: string
    blocks: Record<string, { default: Array<Block['id']>; name: string }>
    props: Record<
      string,
      { default: any | undefined; type: 'string' | 'number' }
    >
  }
}

export const config: Config = {
  Button: {
    component: components.Button,
    name: 'Button',
    blocks: {},
    props: {
      children: { default: 'Button', type: 'string' },
      icon: { default: undefined, type: 'string' },
    },
  },
  Heading: {
    component: components.Heading,
    name: 'Heading',
    blocks: {},
    props: {
      children: { default: 'Heading', type: 'string' },
    },
  },
  Container: {
    component: components.Container,
    name: 'Container',
    blocks: {
      left: { default: [], name: 'Left' },
      right: { default: [], name: 'Right' },
    },
    props: {
      title: { default: 'Container Title', type: 'string' },
    },
  },
}

export type Context = {
  queryClient: QueryClient
  getExperience: typeof getExperience
  getExperiences: typeof getExperiences
  getBlock: typeof getBlock
  updateBlock: typeof updateBlock
  deleteExperience: typeof deleteExperience
  addExperience: typeof addExperience
  addBlock: typeof addBlock
  deleteBlocksRecursivley: typeof deleteBlocksRecursivley
  updateExperience: typeof updateExperience
  config: typeof config
}

export const router = createRouter({
  routeTree,
  context: {
    updateBlock,
    queryClient,
    addExperience,
    addBlock,
    updateExperience,
    getExperiences,
    getBlock,
    getExperience,
    deleteExperience,
    deleteBlocksRecursivley,
    config,
  },
})

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
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <TanStackRouterDevtools initialIsOpen={false} router={router} />
        <ReactQueryDevtools initialIsOpen={false} client={queryClient} />
      </QueryClientProvider>
    </StrictMode>,
  )
}
