import { useSuspenseQuery } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { Context } from '../main'

export function pageGetManyOpts(args: { context: Context }) {
  return {
    queryKey: ['experiences'],
    queryFn: () => args.context.getMany({ store: 'experiences', sortBy: ['createdAt', 'descending'] }),
  }
}

export function usePageGetMany() {
  const context = useRouteContext({ from: '/experiences/' })
  return useSuspenseQuery(pageGetManyOpts({ context }))
}
