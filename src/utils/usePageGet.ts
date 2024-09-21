import { useSuspenseQuery } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { Experience } from '../db'
import { Context } from '../main'

export function pageGetOpts(args: { id: Experience['id']; context: Context }) {
  return {
    queryKey: ['experiences', args.id],
    queryFn: () => args.context.get({ id: args.id, store: 'experiences' }),
  }
}

export function usePageGet(args: { id: Experience['id'] }) {
  const context = useRouteContext({ from: '/experiences/$id' })
  return { pageGet: useSuspenseQuery(pageGetOpts({ id: args.id, context })) }
}
