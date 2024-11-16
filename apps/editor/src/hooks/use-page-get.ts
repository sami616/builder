import { useSuspenseQuery } from '@tanstack/react-query'
import { Page } from '@/db'
import { get } from '@/api'

export function pageGetOpts(args: { id: Page['id'] }) {
  return {
    queryKey: ['pages', args.id],
    queryFn: () => get({ id: args.id, store: 'pages' }),
  }
}

export function usePageGet(args: { id: Page['id'] }) {
  return { pageGet: useSuspenseQuery(pageGetOpts({ id: args.id })) }
}
