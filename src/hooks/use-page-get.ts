import { useSuspenseQuery } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { Page } from '@/db'
import { Context } from '@/main'

export function pageGetOpts(args: { id: Page['id']; context: Context }) {
  return {
    queryKey: ['pages', args.id],
    queryFn: () => args.context.get({ id: args.id, store: 'pages' }),
  }
}

export function usePageGet(args: { id: Page['id'] }) {
  const context = useRouteContext({ from: '/pages/$id' })
  return { pageGet: useSuspenseQuery(pageGetOpts({ id: args.id, context })) }
}
