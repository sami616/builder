import { useSuspenseQuery } from '@tanstack/react-query'
import { Context } from '@/main'
import { context } from '@/main'

export function pageGetManyOpts(args: { context: Context }) {
  return {
    queryKey: ['pages'],
    queryFn: () => args.context.getMany({ store: 'pages', sortBy: ['createdAt', 'descending'] }),
  }
}

export function usePageGetMany() {
  const pageGetMany = useSuspenseQuery(pageGetManyOpts({ context }))
  return { pageGetMany }
}
