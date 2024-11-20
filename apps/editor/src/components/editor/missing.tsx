import { Card, CardTitle } from '#components/ui/card.tsx'
import { AlertCircle } from 'lucide-react'

export function Missing(props: { node: { type: 'component'; name: string } | { type: 'slot'; name: string } }) {
  return (
    <Card className="rounded-none bg-white item-center flex p-4 gap-2 text-sm justify-center">
      <AlertCircle size={16} className="stroke-red-500 shrink-0" />
      <CardTitle className="m-0 font-normal">
        {props.node.name} {props.node.type} not found
      </CardTitle>
    </Card>
  )
}
