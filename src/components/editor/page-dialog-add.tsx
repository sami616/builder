import { useNavigate } from '@tanstack/react-router'
import { usePageAdd } from '@/hooks/use-page-add'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useIsMutating } from '@tanstack/react-query'
import { useState } from 'react'

const formSchema = z.object({
  title: z.string().trim().min(1, { message: 'Title required' }),
  description: z.string(),
  url: z.string(),
  slug: z
    .string()
    .trim()
    .min(1, { message: 'Slug required' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Slug must only contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen.',
    }),
})

export function PageAdd() {
  const navigate = useNavigate({ from: '/pages' })
  const { pageAdd, pageAddIsPending } = usePageAdd()
  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { title: '', description: '', slug: '' } })
  const pageCRUDPending = Boolean(useIsMutating({ mutationKey: ['page'] }))
  const [addNewPageDialogOpen, setAddNewPageDialogOpen] = useState(false)

  return (
    <>
      <Button disabled={pageCRUDPending} onClick={() => setAddNewPageDialogOpen(true)} variant="default">
        Add new
      </Button>
      <Dialog
        open={addNewPageDialogOpen}
        onOpenChange={(bool) => {
          if (bool === false) {
            if (!pageAddIsPending) {
              setAddNewPageDialogOpen(bool)
            }
          } else {
            setAddNewPageDialogOpen(bool)
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
              className="grid gap-4"
              onSubmit={form.handleSubmit(async (values) => {
                const id = await pageAdd({
                  entry: {
                    store: 'pages',
                    title: values.title,
                    description: values.description,
                    slug: values.slug,
                    url: values.url,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    slots: { root: [] },
                    status: 'draft',
                  },
                })
                setAddNewPageDialogOpen(false)
                navigate({ to: `/pages/${id}` })
              })}
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input required placeholder="My landing page" {...field} />
                    </FormControl>
                    <FormDescription>The name of your page</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input required placeholder="my-landing-page" {...field} />
                    </FormControl>
                    <FormDescription>
                      The URL-friendly part of your page address (e.g., yourwebsite.com/page-slug). Use lowercase letters, numbers, and hyphens.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>The page description for search indexing</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourwebsite.com" {...field} />
                    </FormControl>
                    <FormDescription>The URL of you page. This will be used to generate user friendly social media links</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button disabled={pageAddIsPending} variant="outline">
                    Close
                  </Button>
                </DialogClose>
                <Button disabled={pageAddIsPending} type="submit" variant="default">
                  {pageAddIsPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}