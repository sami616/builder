import { useNavigate } from '@tanstack/react-router'
import { usePageAdd } from '../utils/usePageAdd'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const formSchema = z.object({ name: z.string() })

export function PageDialogAdd(props: { addNewPageDialogOpen: boolean; setAddNewPageDialogOpen: (bool: boolean) => void }) {
  const navigate = useNavigate({ from: '/pages' })
  const { pageAdd } = usePageAdd()
  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { name: '' } })

  return (
    <Dialog
      open={props.addNewPageDialogOpen}
      onOpenChange={(bool) => {
        if (bool === false) {
          if (!pageAdd.isPending) {
            props.setAddNewPageDialogOpen(bool)
          }
        } else {
          props.setAddNewPageDialogOpen(bool)
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create page</DialogTitle>
          <DialogDescription>Create and design a new page for your site.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              const id = await pageAdd.mutateAsync({
                entry: {
                  store: 'pages',
                  name: values.name,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  slots: { root: [] },
                  status: 'draft',
                },
              })
              props.setAddNewPageDialogOpen(false)
              navigate({ to: `/pages/${id}` })
            })}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input required placeholder="My landing page" {...field} />
                  </FormControl>
                  <FormDescription>Set a name for your new page</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button disabled={pageAdd.isPending} variant="outline">
                  Close
                </Button>
              </DialogClose>
              <Button disabled={pageAdd.isPending} type="submit" variant="default">
                {pageAdd.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
