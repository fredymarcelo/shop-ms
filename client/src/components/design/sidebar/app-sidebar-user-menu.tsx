"use client"

import {ChevronsUpDown, LogOut, MessageSquareIcon, UserIcon,} from "lucide-react"
import {Avatar, AvatarFallback, AvatarImage,} from "@/components/ui/avatar"
import {DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,} from "@/components/ui/sidebar"
import {useMemo} from "react";
import {alert} from "@/providers/alert-dialogs.tsx";

export interface AppSidebarUserMenuProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}


export function AppSidebarUserMenu({user}: Readonly<AppSidebarUserMenuProps>) {
  const {isMobile} = useSidebar()
  
  const userOptions = useMemo(() => [
    {
      label: "Profile",
      icon: <UserIcon/>,
      onClick: () => {
        console.log("Profile clicked");
      },
    }, {
      label: "Mensajes",
      icon: <MessageSquareIcon/>,
      onClick: () => {
        console.log("Messages clicked");
      },
    }
  ], []);
  const logout = async () => {
    await alert.question({
      title: "Cerrar sesión",
      description: "¿Estás seguro de que deseas cerrar sesión?",
      onConfirm: () => {
        console.log("Logged out");
      },
    });
  }
  
  return <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <ProfileInfo user={user}/>
            <ChevronsUpDown className="ml-auto size-4"/>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <ProfileInfo user={user}/>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator/>
            <DropdownMenuGroup>
              {userOptions.map(option => (
                <DropdownMenuItem key={option.label} onClick={option.onClick}>
                  {option.icon}
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator/>
            <DropdownMenuItem onClick={logout}>
              <LogOut/>
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>;
}


function ProfileInfo({user}: Readonly<AppSidebarUserMenuProps>) {
  const name = user.name || 'Usuario sin nombre'
  return <>
    <Avatar className="h-8 w-8 rounded-lg">
      <AvatarImage src={user.image ?? undefined}/>
      <AvatarFallback className="rounded-lg">
        {name[0]}
      </AvatarFallback>
    </Avatar>
    <div className="grid flex-1 text-left text-sm leading-tight">
      <span className="truncate font-semibold">{name}</span>
      <span className="truncate text-xs">{user.email}</span>
    </div>
  </>
}
