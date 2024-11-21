import { type DBStores } from '@repo/lib'
import { context } from '#main.tsx'
import { useSuspenseQuery } from '@tanstack/react-query'

export function useBlockGet(args: { id: DBStores['Block']['id'] }) {
  return {
    blockGet: useSuspenseQuery({
      queryKey: ['blocks', args.id],
      queryFn: () => context.get({ id: args.id, store: 'blocks' }),
    }),
  }
}
