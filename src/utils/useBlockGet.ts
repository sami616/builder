import { useSuspenseQuery } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { type Block } from '../db'

export function useBlockGet(args: { id: Block['id'] }) {
  const context = useRouteContext({ from: '/experiences/$id' })
  return {
    blockGet: useSuspenseQuery({
      queryKey: ['blocks', args.id],
      queryFn: () => context.get({ id: args.id, store: 'blocks' }),
    }),
  }
}
