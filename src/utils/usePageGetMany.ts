import { useSuspenseQuery } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { Context } from '../main'

export function pageGetManyOpts(args: { context: Context }) {
  return {
    queryKey: ['pages'],
    queryFn: () => args.context.getMany({ store: 'pages', sortBy: ['createdAt', 'descending'] }),
  }
}

export function usePageGetMany() {
  const context = useRouteContext({ from: '/pages/' })
  const pageGetMany = useSuspenseQuery(pageGetManyOpts({ context }))
  return { pageGetMany }
}
