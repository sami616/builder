import { useSuspenseQuery } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { Context } from '../main'

export function templateGetManyOpts(args: { context: Context }) {
  return {
    queryKey: ['templates'],
    queryFn: () => args.context.getMany({ store: 'templates', sortBy: ['order', 'descending'] }),
  }
}

export function useTemplateGetMany() {
  const context = useRouteContext({ from: '/pages/$id' })
  return { templateGetMany: useSuspenseQuery(templateGetManyOpts({ context })) }
}
