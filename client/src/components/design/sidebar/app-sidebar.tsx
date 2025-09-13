import {Sidebar, SidebarFooter, SidebarRail,} from "@/components/ui/sidebar"
import {Separator} from "@/components/ui/separator";
import {ComponentProps, ReactNode} from "react";
import {AppSidebarUserMenu} from "@/components/design/sidebar/app-sidebar-user-menu";
import {AppSidebarMainMenu, MenuGroup} from "@/components/design/sidebar/app-sidebar-main-menu";
import {AppSideBarHeader} from "@/components/design/sidebar/app-sidebar-header";

export interface AppSidebarProps extends ComponentProps<typeof Sidebar> {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  },
  menuGroups: MenuGroup[],
  grettings: ReactNode,
  appName?: string
}

export function AppSidebar({user, menuGroups, grettings, appName, ...props}: Readonly<AppSidebarProps>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <AppSideBarHeader grettings={grettings} appName={appName}/>
      <AppSidebarMainMenu groups={menuGroups}/>
      <Separator/>
      <SidebarFooter>
        <AppSidebarUserMenu user={user}/>
      </SidebarFooter>
      <SidebarRail/>
    </Sidebar>
  )
}

