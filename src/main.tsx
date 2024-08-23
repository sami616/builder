import * as components from './components'
import { StrictMode } from 'react'
import {
  addBlock,
  addExperience,
  deleteBlock,
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

const queryClient = new QueryClient()

export const config = {
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
      children: { default: [] },
    },
    props: {
      title: { default: 'Container Title', type: 'string' },
    },
  },
} as const

export type Context = {
  queryClient: QueryClient
  getExperience: typeof getExperience
  getExperiences: typeof getExperiences
  getBlock: typeof getBlock
  updateBlock: typeof updateBlock
  deleteExperience: typeof deleteExperience
  addExperience: typeof addExperience
  addBlock: typeof addBlock
  deleteBlock: typeof deleteBlock
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
    deleteBlock,
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
