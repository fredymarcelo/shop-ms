import {SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem} from "@/components/ui/sidebar";
import AppIcon from "@/components/design/app-icon";
import type {ReactNode} from "react";


export interface AppSidebarHeaderProps {
  grettings: ReactNode,
  appName?: string
}

export function AppSideBarHeader({grettings, appName}: Readonly<AppSidebarHeaderProps>) {
  return <SidebarHeader>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
            <AppIcon
              className="w-full h-full object-contain transition-opacity duration-300"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {appName ?? 'appName'}
            </span>
            {grettings}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarHeader>
}
