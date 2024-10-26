import { AvatarImage, Avatar, AvatarFallback } from '@/components/ui/avatar'
import { type Context } from '@/main'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import {
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { ActiveProvider } from '@/hooks/use-active'

export const Route = createRootRouteWithContext<Context>()({
  component: () => (
    <>
      <div className="flex items-center justify-between p-2 gap-2">
        <img src="/logo.svg" className="h-5" />
        <div className="flex gap-2 items-center">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                  <Link to="/pages">Pages</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My profile</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ActiveProvider>
        <Outlet />
      </ActiveProvider>
    </>
  ),
})
