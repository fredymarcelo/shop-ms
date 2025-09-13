import {AppSidebarLayout} from "@/components/design/sidebar/app-sidebar-layout";
import {MenuGroup} from "@/components/design/sidebar/app-sidebar-main-menu";
import {BookOpenIcon, UserIcon} from "lucide-react";
import {Outlet} from "react-router";

export default function Layout() {
  
  const menu: MenuGroup[] = [
    {
      label: "Panel",
      menu: [
        {
          title: "Productos",
          path: "/products",
          icon: <UserIcon/>,
        },
        {
          title: "Ventas",
          path: "/sales",
          icon: <BookOpenIcon/>
        },
      ],
    }
  ]
  
  return <AppSidebarLayout
    user={{
      email: "usr@mail.com",
      name: "Usuario",
    }}
    menuGroups={menu}
    grettings={<span className="truncate text-xs">Bienvenido</span>}
    appName={"SHOP"}
  >
    <Outlet/>
  </AppSidebarLayout>
}