import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {ChevronsUpDownIcon, LoaderCircle} from "lucide-react";

export interface DropdownPerPageProps {
  options: number[],
  pageSize: number,
  onPageSizeChange: (value: number) => void,
  loading: boolean,
  className?: string,
}

export function DropdownEntitiesPerPagination({options, pageSize, onPageSizeChange, loading, className}: Readonly<DropdownPerPageProps>) {
  return <div className={className}>
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={loading}>
        <div className="flex items-center">
          <Button variant="outline" className="ml-4">
            Por página {pageSize}
            {loading ? <LoaderCircle className="animate-spin"/> : <ChevronsUpDownIcon/>}
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((size) => (
          <DropdownMenuItem
            key={size}
            onClick={() => size !== pageSize && onPageSizeChange(size)}
          >
            {size}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
}