import type {Table} from "@tanstack/react-table";
import {DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {EyeIcon} from "lucide-react";

interface DropdownVisibleColumnsProps<TEntity> {
  table: Table<TEntity>
  className?: string
}

export function DropdownVisibleColumns<TEntity>({table, className}: Readonly<DropdownVisibleColumnsProps<TEntity>>) {
  return <div className={className}>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <EyeIcon/>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {table.getAllColumns().filter((column) => column.getCanHide()).map((column) => {
          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(value)}
            >
              {typeof column.columnDef.header === "string" ? column.columnDef.header : ""}
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
}
