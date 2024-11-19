import { useSuspenseQuery } from '@tanstack/react-query'
import { context } from '#main.tsx'

export function templateGetManyOpts() {
  return {
    queryKey: ['templates'],
    queryFn: () => context.getMany({ store: 'templates', sortBy: ['order', 'descending'] }),
  }
}

export function useTemplateGetMany() {
  return { templateGetMany: useSuspenseQuery(templateGetManyOpts()) }
}
