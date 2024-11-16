import { useSuspenseQuery } from '@tanstack/react-query'
import { type Block } from '@/db'
import { useRouteContext } from '@tanstack/react-router'

export function useBlockGet(args: { id: Block['id'] }) {
  const context = useRouteContext({ from: '/_layout/pages/$id/' })
  return {
    blockGet: useSuspenseQuery({
      queryKey: ['blocks', args.id],
      queryFn: () => context.get({ id: args.id, store: 'blocks' }),
    }),
  }
}
