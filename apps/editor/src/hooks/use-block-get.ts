import { type Block } from '#db.ts'
import { context } from '#main.tsx'
import { useSuspenseQuery } from '@tanstack/react-query'

export function useBlockGet(args: { id: Block['id'] }) {
  return {
    blockGet: useSuspenseQuery({
      queryKey: ['blocks', args.id],
      queryFn: () => context.get({ id: args.id, store: 'blocks' }),
    }),
  }
}
