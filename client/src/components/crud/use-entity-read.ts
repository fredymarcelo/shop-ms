import type {Entity, Findable, Page, Pageable, PageDetails} from "@/lib/crud";
import {type ColumnDef, type ColumnFilter, type ColumnFiltersState, getCoreRowModel, type HeaderGroup, type PaginationState, type SortingState, type Table, type TableState, type Updater, useReactTable} from "@tanstack/react-table";
import {type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useState} from "react";
import type {ErrorDescription} from "@/lib/errors";
import {parsePageQuery} from "@/components/crud/entity-crud-utils";
import {keepPreviousData, useQuery, useQueryClient} from "@tanstack/react-query";
import {unwrap} from "@/lib/result";

export enum LoadingReadTarget {
  Data,
  NextPage,
  BackPage,
  Search,
  PageSize,
}

export type LoadingSorting = {
  columnId: string;
}

export type LoadingTableState = LoadingReadTarget | LoadingSorting | undefined;

export interface EntityReadProps<
  TEntity extends Entity<ID>,
  ID = TEntity['id'],
> {
  cacheKey: string;
  pageAction: Pageable<TEntity>["page"];
  findAction: Findable<TEntity>["find"];
  columns: ColumnDef<TEntity>[];
  toQuery?: (columnFilters: ColumnFilter[]) => string;
  initialState?: Partial<TableState>;
}

export interface EntityRead<TEntity extends Entity<ID>, ID = TEntity['id']> {
  entities: readonly TEntity[] | undefined; // entidades obtenidas de la consulta, undefined si aún no se han cargado
  page: PageDetails | undefined; // detalles de la página actual, undefined si aún no se han cargado
  refreshTable: () => void; // recarga la tabla, actualizando el estado de las entidades
  table: Table<TEntity>, // instancia de la tabla de tanstack
  loading: LoadingTableState; // estado de carga de la tabla a nivel granular
  search: string; // valor de búsqueda actual
  onSearchChange: Dispatch<SetStateAction<string>>; // función para actualizar el valor de búsqueda
  replaceEntity: (entity: TEntity) => void;
  refreshEntity: (id: ID) => Promise<TEntity>; // refresca una entidad específica, actualizando su estado en la tabla
  error: ErrorDescription | null; // error actual, si lo hay
}

export function useEntityRead<TEntity extends Entity<ID>, ID = TEntity['id']>({
  cacheKey,
  columns,
  pageAction,
  findAction,
  toQuery,
  initialState = {},
}: EntityReadProps<TEntity>): EntityRead<TEntity> {
  
  const queryClient = useQueryClient();
  
  const [loading, setLoading] = useState<LoadingTableState>(LoadingReadTarget.Data);
  const [sorting, setSorting] = useState<SortingState>(initialState.sorting ?? []);
  const [pagination, setPagination] = useState<PaginationState>(initialState.pagination ?? {pageIndex: 0, pageSize: 10});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialState.columnFilters ?? []);
  const [globalFilter, setGlobalFilter] = useState<string>(initialState.globalFilter ?? '');
  const [debounceGlobalFilter, setDebounceGlobalFilter] = useState(globalFilter);
  
  const queryKey = useMemo<[string, Partial<TableState>]>(
    () => [cacheKey, {pagination, sorting, columnFilters, globalFilter}],
    [cacheKey, pagination, sorting, columnFilters, globalFilter]
  );
  
  const query = useQuery<Page<TEntity>, ErrorDescription>({
    queryKey,
    queryFn: async () => unwrap(await pageAction(parsePageQuery(queryKey[1], toQuery))),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setGlobalFilter((prev: string) => {
        if (prev === debounceGlobalFilter) return prev; // No cambiar si no hay cambio
        setLoading(LoadingReadTarget.Search);
        setPagination(prev => ({...prev, pageIndex: 0})); // Reiniciar a la primera página
        return debounceGlobalFilter;
      });
    }, 500);
    return () => clearTimeout(handler);
  }, [debounceGlobalFilter]);
  
  
  const entities = query.data?.content;
  const page = query.data?.page;
  
  const reactTable = useReactTable<TEntity>({
    columns,
    data: entities ?? [],
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: {
      pagination,
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setDebounceGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    pageCount: page?.totalPages ?? -1,
  });
  
  const table = useMemo<Table<TEntity>>(() => ({
    ...reactTable,
    nextPage() {
      if (!table.getCanNextPage()) return;
      setLoading(LoadingReadTarget.NextPage);
      reactTable.nextPage();
    },
    previousPage() {
      if (!table.getCanPreviousPage()) return;
      setLoading(LoadingReadTarget.BackPage);
      reactTable.previousPage();
    },
    setPageSize(size: Updater<number>) {
      setLoading(LoadingReadTarget.PageSize);
      reactTable.setPageSize(size);
    },
    firstPage() {
      setLoading(LoadingReadTarget.Data);
      reactTable.firstPage();
    },
    setGlobalFilter(value: Updater<string>) {
      setLoading(LoadingReadTarget.Search);
      reactTable.setGlobalFilter(value);
    },
    resetPageIndex(defaultState?: boolean) {
      setLoading(LoadingReadTarget.Data);
      reactTable.resetPageIndex(defaultState);
    },
    setColumnFilters(updater: Updater<ColumnFilter[]>) {
      setLoading(LoadingReadTarget.Data);
      reactTable.setColumnFilters(updater);
    },
    setSorting(updater: Updater<SortingState>) {
      setLoading(LoadingReadTarget.Data);
      reactTable.setSorting(updater);
    },
    getHeaderGroups() {
      return reactTable.getHeaderGroups().map<HeaderGroup<TEntity>>(headerGroup => ({
        ...headerGroup,
        headers: headerGroup.headers.map(header => {
          const column = header.column;
          return ({
            ...header,
            column: {
              ...column,
              setFilterValue(updater: Updater<unknown>) {
                if (!column.getCanFilter()) return;
                setLoading(LoadingReadTarget.Data);
                column.setFilterValue(updater);
              },
              toggleSorting(desc?: boolean, isMulti?: boolean) {
                if (!column.getCanSort()) return;
                setLoading({columnId: column.id});
                column.toggleSorting(desc, isMulti);
              },
              clearSorting() {
                if (!column.getCanSort()) return;
                setLoading({columnId: column.id});
                column.clearSorting();
              }
            }
          });
        })
      }));
    }
  }), [reactTable]);
  
  const refreshTable = useCallback(() => {
    setLoading(LoadingReadTarget.Data);
    queryClient.invalidateQueries({
      queryKey: [cacheKey],
      exact: false, // permite coincidencias parciales
    }).then();
  }, [cacheKey, queryClient]);
  
  const replaceEntity = useCallback((entity: TEntity) => {
    queryClient.setQueryData<Page<TEntity>>(queryKey, (oldPage) => {
      if (!oldPage) return oldPage;
      const updatedContent = oldPage.content.map(e => e.id === entity.id ? entity : e);
      return {
        ...oldPage,
        content: updatedContent,
      };
    });
  }, [queryClient, queryKey]);
  
  const refreshEntity = useCallback(async (id: ID) => {
    const refreshed = await findAction(id);
    if (refreshed.success) {
      replaceEntity(refreshed.data);
      return refreshed.data;
    } else {
      console.error(`Failed to refresh entity with ID ${id}:`, refreshed.error);
      throw refreshed.error;
    }
  }, [findAction, replaceEntity]);
  
  return {
    entities,
    page,
    refreshTable,
    table,
    loading: query.isFetching ? loading : undefined,
    search: debounceGlobalFilter,
    onSearchChange: setDebounceGlobalFilter,
    replaceEntity,
    refreshEntity,
    error: query.error,
  };
}
