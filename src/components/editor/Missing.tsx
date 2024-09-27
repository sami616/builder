import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function Missing(props: { node: { type: 'component'; name: string } | { type: 'slot'; name: string } }) {
  return (
    <Alert className="bg-white" variant="destructive">
      <ExclamationTriangleIcon className="size-4" />
      <AlertTitle>Missing {props.node.type}</AlertTitle>
      <AlertDescription>
        {props.node.name} {props.node.type} not found
      </AlertDescription>
    </Alert>
  )
}
