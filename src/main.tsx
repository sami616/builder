import { StrictMode } from 'react'
import {
  addExperience,
  deleteExperience,
  getExperience,
  getExperiences,
  updateExperience,
} from './api'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()

export type Context = {
  queryClient: QueryClient
  getExperience: typeof getExperience
  getExperiences: typeof getExperiences
  deleteExperience: typeof deleteExperience
  addExperience: typeof addExperience
  updateExperience: typeof updateExperience
}

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    addExperience,
    updateExperience,
    getExperiences,
    getExperience,
    deleteExperience,
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
