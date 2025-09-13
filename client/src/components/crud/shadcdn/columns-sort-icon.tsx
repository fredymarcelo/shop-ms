import type {SortDirection} from "@tanstack/react-table";
import {ChevronDown, ChevronsUpDownIcon, ChevronUp, LoaderCircle} from "lucide-react";

export function ColumnSortIcon({
  isSorted, sorting
}: Readonly<{
  isSorted: false | SortDirection,
  sorting: boolean
}>) {
  if (sorting) return <LoaderCircle className="animate-spin font-bold size-4"/>;
  if (isSorted === false) return <ChevronsUpDownIcon className="font-bold size-4"/>;
  return isSorted === "asc" ? <ChevronUp className="font-bold size-4"/> : <ChevronDown className="font-bold size-4"/>;
}
