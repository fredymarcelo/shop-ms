import type {ColumnFilter, SortingState, TableState} from "@tanstack/react-table";
import type {PageQuery, Sort} from "@/lib/crud";
import type {LoadingSorting, LoadingTableState} from "@/components/crud/use-entity-read";

export function parsePageQuery(state: Partial<TableState>, toQuery?: (columnFilters: ColumnFilter[]) => string): PageQuery {
  return {
    search: state.globalFilter,
    page: state.pagination?.pageIndex,
    size: state.pagination?.pageSize,
    sorts: mapSorts(state.sorting),
    query: toQuery ? toQuery(state.columnFilters ?? []) : undefined,
  };
}

function mapSorts(sorting?: SortingState): Sort[] {
  return sorting?.map<Sort>(({id, desc}) => ({
    property: id,
    direction: desc ? 'desc' : 'asc',
  })) ?? [];
}

export function isLoadingSorting(loading: LoadingTableState): loading is LoadingSorting {
  return typeof loading === "object" && "columnId" in loading;
}