import type {PropsWithChildren, ReactNode} from "react";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/design/sidebar/app-sidebar";
import type {MenuGroup} from "@/components/design/sidebar/app-sidebar-main-menu";


export interface DashboardLayoutProps extends PropsWithChildren {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  },
  menuGroups: MenuGroup[]
  grettings: ReactNode,
  appName?: string
}

export function AppSidebarLayout({children, user, grettings, appName, menuGroups}: Readonly<DashboardLayoutProps>) {
  return <SidebarProvider>
    <AppSidebar
      user={user}
      menuGroups={menuGroups}
      grettings={grettings}
      appName={appName}
    />
    <SidebarInset className="overflow-hidden">
      {children}
    </SidebarInset>
  </SidebarProvider>
}
