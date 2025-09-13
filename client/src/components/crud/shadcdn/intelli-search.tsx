import {Input} from "@/components/ui/input";
import {LoaderCircle, SearchIcon} from "lucide-react";

export interface IntelliSearchProps {
  value?: string,
  onSearchChange: (value: string) => void,
  loading: boolean,
  className?: string,
}

export function IntelliSearch({value, onSearchChange, loading, className}: Readonly<IntelliSearchProps>) {
  return (
    <div className={className}>
      <div className="relative">
        <Input
          value={value}
          placeholder="Buscar"
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
        <SearchIcon className="absolute top-1/2 left-3 transform -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
        <div className="absolute top-1/2 right-3 transform -translate-y-1/2 h-5 w-5 text-muted-foreground">
          {loading && <LoaderCircle className="animate-spin"/>}
        </div>
      </div>
    </div>
  )
}
