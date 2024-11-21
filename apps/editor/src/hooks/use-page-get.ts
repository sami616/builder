import { DBStores } from '@repo/lib'
import { get } from '#api.ts'
import { useSuspenseQuery } from '@tanstack/react-query'

export function pageGetOpts(args: { id: DBStores['Page']['id'] }) {
  return {
    queryKey: ['pages', args.id],
    queryFn: () => get({ id: args.id, store: 'pages' }),
  }
}

export function usePageGet(args: { id: DBStores['Page']['id'] }) {
  return { pageGet: useSuspenseQuery(pageGetOpts({ id: args.id })) }
}
