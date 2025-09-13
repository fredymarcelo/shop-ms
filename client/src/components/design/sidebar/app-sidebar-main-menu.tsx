import {ChevronRight} from "lucide-react"
import {Collapsible, CollapsibleContent, CollapsibleTrigger,} from "@/components/ui/collapsible"
import {SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,} from "@/components/ui/sidebar"
import {Link} from "react-router";
import type {ReactNode} from "react";

export interface MenuItem {
  title: string
  path: string
  icon?: ReactNode
}

export interface MenuItemWithSubMenu extends Omit<MenuItem, "path"> {
  open?: boolean
  subMenu: MenuSubItem[]
}

export interface MenuSubItem {
  title: string
  path: string
}

export interface MenuGroup {
  label: string,
  menu: Array<MenuItem | MenuItemWithSubMenu>
}

export interface AppSidebarMainMenuProps {
  groups: MenuGroup[]
}

export function AppSidebarMainMenu({groups}: Readonly<AppSidebarMainMenuProps>) {
  return (
    <SidebarContent className="gap-1 mt-1 scroll-element">
      {groups.map((group) =>
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>
            {group.label}
          </SidebarGroupLabel>
          <SidebarMenu>
            {group.menu.map((item) => {
              if ("subMenu" in item) {
                return <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.open}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    {item.subMenu && item.subMenu.length > 0 && (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title}>
                            {item.icon}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"/>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.subMenu.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild>
                                  <Link to={subItem.path}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              }
              
              return <SidebarMenuItem key={item.title}>
                <Link to={item.path}>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            })}
          </SidebarMenu>
        </SidebarGroup>
      )}
    </SidebarContent>
  )
}
