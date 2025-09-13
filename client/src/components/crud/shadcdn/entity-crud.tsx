"use client"

import type {Entity} from "@/lib/crud";
import {type PropsWithChildren, type  ReactNode, useEffect, useImperativeHandle, useMemo, useState} from "react";
import {type Column, type  ColumnMeta, flexRender, type Table} from "@tanstack/react-table"
import {Table as TableComponent, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {Button} from "@/components/ui/button";
import {AlertCircleIcon, ChevronLeft, ChevronRight, EditIcon, EllipsisVerticalIcon, LoaderCircle, PlusIcon, RefreshCwIcon, TrashIcon} from "lucide-react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import type {FieldValues} from "react-hook-form";
import type {DeleteProps, EntityAction, EntityCrudApi, EntityCrudPropsWithCustomProps, UpdateProps} from "@/components/crud/entity-crud";
import type {ErrorDescription} from "@/lib/errors";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {isLoadingSorting} from "@/components/crud/entity-crud-utils";
import {LoadingReadTarget, useEntityRead} from "@/components/crud/use-entity-read";
import {toast} from "sonner";
import {EntityCreateForm} from "@/components/crud/shadcdn/entity-create";
import {EntityUpdateForm} from "@/components/crud/shadcdn/entity-update";
import {EntityDeleteForm} from "@/components/crud/shadcdn/entity-delete";
import {DropdownVisibleColumns} from "@/components/crud/shadcdn/dropdown-visible-columns";
import {ColumnSortIcon} from "@/components/crud/shadcdn/columns-sort-icon";
import {DropdownEntitiesPerPagination} from "@/components/crud/shadcdn/dropdown-entities-per-pagination";
import {IntelliSearch} from "@/components/crud/shadcdn/intelli-search";
import {cn} from "@/lib/utils";

interface CustomProps {
  read: {
    title?: ReactNode,
    perPage?: number[];
  }
}

export function EntityCrud<TEntity extends Entity<ID>, Dto extends FieldValues, ID = TEntity["id"]>({
  cacheKey,
  apiRef,
  create: createProps,
  read: {
    title,
    perPage = [5, 10, 25, 50, 100],
    entityActions = [],
    initialState: {
      pagination = {pageIndex: 0, pageSize: perPage[0]},
      ...initialState
    } = {},
    ...readProps
  },
  update: updateProps,
  delete: deleteProps,
}: Readonly<EntityCrudPropsWithCustomProps<TEntity, Dto, ID, CustomProps>>) {
  
  const read = useEntityRead<TEntity>({
    cacheKey,
    initialState: {
      pagination,
      ...initialState,
    },
    ...readProps,
  });
  
  const [createOpen, setCreateOpen] = useState(false);
  
  const actions = useEntityActions<TEntity, Dto>({
    entityActions,
    updateProps,
    deleteProps,
  });
  
  const crudApi = useMemo<EntityCrudApi<TEntity>>(() => ({
    entities: read.entities,
    replaceEntity: read.replaceEntity,
    refreshEntity: read.refreshEntity,
    refreshTable: read.refreshTable,
  }), [read.entities, read.refreshEntity, read.replaceEntity, read.refreshTable]);
  
  useImperativeHandle(apiRef, () => crudApi, [crudApi]);
  
  const hasActions = actions.length > 0;
  
  return (
    <div className="w-full">
      {["string", "number"].includes(typeof title) ? <h2 className="text-2xl font-bold mb-4">{title}</h2> : title}
      <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 items-center">
        <IntelliSearch
          value={read.search}
          onSearchChange={read.onSearchChange}
          loading={read.loading === LoadingReadTarget.Search}
          className="col-span-1 sm:col-span-2 lg:col-span-4"
        />
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex items-center justify-end space-x-2">
          <DropdownEntitiesPerPagination
            options={perPage}
            pageSize={read.table.getState().pagination.pageSize}
            onPageSizeChange={read.table.setPageSize}
            loading={read.loading === LoadingReadTarget.PageSize}
          />
          <DropdownVisibleColumns table={read.table}/>
          <Button
            variant="outline"
            size="icon"
            onClick={read.refreshTable}
            disabled={read.loading !== undefined}
          >
            <RefreshCwIcon/>
          </Button>
          {(createProps && (createProps.enabled ?? true)) && <>
            <Button
              onClick={() => setCreateOpen(true)}
              variant="outline"
            >
              <PlusIcon/>
              Crear
            </Button>
            <EntityCreateForm
              {...createProps}
              open={createOpen}
              onOpenChange={setCreateOpen}
              crudApi={crudApi}
              onSuccess={async (entity) => {
                // Ejecutamos el callback onSuccess si está definido dentro de createProps
                const onSuccess = createProps.onSuccess;
                if (onSuccess) await onSuccess(entity);
                setCreateOpen(false);
                
                // Muestra un mensaje de éxito
                toast.success('Registro creado', {
                  description: 'El registro se ha creado correctamente',
                });
                
                // Recargamos la tabla manteniendo el estado actual
                read.refreshTable();
              }}
            />
          </>}
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <TableComponent>
          <TableHeader className="bg-primary bg-opacity-50">
            {read.table.getHeaderGroups().map((headerGroup) => {
              return (
                <TableRow key={headerGroup.id} className="bg-primary hover:bg-primary">
                  {headerGroup.headers.map((header) => {
                    const column = header.column;
                    const filters = column.columnDef.meta?.filters;
                    return <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="text-primary-foreground"
                      style={{
                        verticalAlign: "top"
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            onKeyDown={(e) => console.log(e)}
                            onClick={() => column.toggleSorting()}
                            className={cn(
                              "font-bold items-center justify-center flex gap-2 h-full w-full",
                              column.getCanSort() ? 'cursor-pointer select-none' : '',
                            )}
                          >
                            {flexRender(
                              column.columnDef.header,
                              header.getContext()
                            )}
                            {column.getCanSort() && (
                              <ColumnSortIcon
                                isSorted={column.getIsSorted()}
                                sorting={isLoadingSorting(read.loading) && read.loading.columnId === column.id}
                              />
                            )}
                          </div>
                          {(column.getCanFilter() && filters) ? (
                            <div className='mb-2'>
                              <Filter column={column} filters={filters}/>
                            </div>
                          ) : null}
                        </>
                      )}
                    </TableHead>
                  })}
                  {hasActions && <TableHead/>}
                </TableRow>
              );
            })}
          </TableHeader>
          <TableBody>
            <CrudTableFallback<TEntity>
              loading={read.loading === LoadingReadTarget.Data}
              error={read.error}
              table={read.table}
              aditionalCell={hasActions}
            >
              {read.table.getRowModel().rows.map((row) => {
                const entity = row.original;
                return <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                  {hasActions && <TableCell className="sticky right-0 bg-background">
                    <div className="absolute left-0 top-0 h-full w-px border-l"/>
                    <div className="flex items-center justify-center h-full">
                      <EntityActionsDropdown>
                        {actions.map(action => {
                          return (
                            <EntityActionRender
                              key={action.id}
                              entityAction={action}
                              entity={entity}
                              crudApi={crudApi}
                            />
                          );
                        })}
                      </EntityActionsDropdown>
                    </div>
                  </TableCell>}
                </TableRow>
              })}
            </CrudTableFallback>
          </TableBody>
        </TableComponent>
      </div>
      <div className="flex items-center justify-between mt-4">
        {read.page &&
          <span className="text-sm text-muted-foreground">
          Total de registros: <b>{read.page.totalElements}</b>
        </span>}
        {read.page &&
          <div className="space-x-2">
            <span className="text-sm text-muted-foreground">
              Página {read.page.number + 1} de {read.page.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={read.table.previousPage}
              disabled={!read.table.getCanPreviousPage() || read.loading !== undefined}
            >
              {read.loading === LoadingReadTarget.BackPage
                ? <LoaderCircle className="animate-spin"/>
                : <ChevronLeft/>
              }
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={read.table.nextPage}
              disabled={!read.table.getCanNextPage() || read.loading !== undefined}
            >
              {read.loading === LoadingReadTarget.NextPage
                ? <LoaderCircle className="animate-spin"/>
                : <ChevronRight/>
              }
            </Button>
          </div>}
      </div>
    </div>
  );
}

interface CrudTableFallbackProps<TEntity> extends PropsWithChildren {
  loading: boolean;
  error: ErrorDescription | null,
  table: Table<TEntity>,
  aditionalCell: boolean,
}

function CrudTableFallback<TEntity>({
  loading,
  error,
  table,
  children,
  aditionalCell
}: Readonly<CrudTableFallbackProps<TEntity>>) {
  
  const addSpan = aditionalCell ? 1 : 0;
  
  const columnsLength = table.getAllColumns().length;
  
  if (error) return (
    <TableRow>
      <TableCell colSpan={columnsLength + addSpan}>
        <Alert variant="destructive">
          <AlertCircleIcon/>
          <AlertTitle>{error.title}</AlertTitle>
          <AlertDescription>
            <p>{error.description}</p>
          </AlertDescription>
        </Alert>
      </TableCell>
    </TableRow>
  );
  
  if (loading) return (
    <TableRow>
      <TableCell colSpan={columnsLength + addSpan} className="h-24 text-center">
        <div className="flex items-center justify-center space-x-2 flex-col">
          <LoaderCircle className="animate-spin"/>
          Cargando...
        </div>
      </TableCell>
    </TableRow>
  );
  
  if (table.getRowModel().rows.length === 0) return (
    <TableRow>
      <TableCell colSpan={columnsLength + addSpan} className="h-24 text-center">
        No hay datos
      </TableCell>
    </TableRow>
  );
  
  return children;
}

function EntityActionsDropdown({children}: Readonly<PropsWithChildren>) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <EllipsisVerticalIcon className="hover:cursor-pointer"/>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator/>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EntityActionRender<TEntity extends Entity<ID>, ID = TEntity["id"]>({
  entityAction,
  entity,
  crudApi
}: Readonly<{
  entityAction: EntityAction<TEntity>,
  entity: TEntity,
  crudApi: EntityCrudApi<TEntity>
}>) {
  
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const enabled = entityAction.enabled === undefined || entityAction.enabled(entity);
  
  if (!enabled) {
    return <></>;
  }
  
  const label = typeof entityAction.label === "function" ? entityAction.label(entity) : entityAction.label;
  const icon = typeof entityAction.icon === "function" ? entityAction.icon(entity) : entityAction.icon;
  
  const clickHandler = () => {
    if (!("onClick" in entityAction)) {
      setOpen(true);
      return;
    }
    const value = entityAction.onClick(entity, crudApi);
    if (value instanceof Promise) {
      setLoading(true);
      value.finally(() => setLoading(false));
    }
  }
  
  if ("onClick" in entityAction) {
    const showLoading = loading && entityAction.hideLoading !== true;
    return (
      <DropdownMenuItem onSelect={(e) => {
        e.preventDefault();
        clickHandler();
      }}>
        {showLoading
          ? <LoaderCircle className="animate-spin"/>
          : icon
        }
        {label}
      </DropdownMenuItem>
    );
  }
  
  return (
    <>
      <DropdownMenuItem onSelect={(e) => {
        e.preventDefault();
        clickHandler()
      }}>
        {icon}
        {label}
      </DropdownMenuItem>
      <entityAction.actionComponent
        entity={entity}
        crudApi={crudApi}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

function useEntityActions<TEntity extends Entity<ID>, Dto extends FieldValues, ID = TEntity["id"]>({
  entityActions,
  updateProps,
  deleteProps,
}: Readonly<{
  entityActions: EntityAction<TEntity>[],
  updateProps?: UpdateProps<TEntity, Dto>,
  deleteProps?: DeleteProps<TEntity>,
}>): EntityAction<TEntity>[] {
  
  return useMemo(() => {
    const defaultActions: EntityAction<TEntity>[] = [];
    if (updateProps) {
      defaultActions.push({
        enabled: updateProps.enabled,
        id: "update",
        label: "Actualizar",
        icon: <EditIcon/>,
        actionComponent: props => (
          <EntityUpdateForm
            {...updateProps}
            {...props}
            onSuccess={async (entity) => {
              if (updateProps.onSuccess) await updateProps.onSuccess(entity);
              props.onOpenChange(false);
              props.crudApi.replaceEntity(entity);
              toast.success("Registro actualizado", {
                description: "El registro se ha actualizado correctamente",
              });
            }}
          />
        ),
      });
    }
    
    if (deleteProps) {
      defaultActions.push({
        enabled: deleteProps.enabled,
        id: "delete",
        label: "Eliminar",
        icon: <TrashIcon/>,
        actionComponent: props => (
          <EntityDeleteForm
            {...deleteProps}
            {...props}
            onSuccess={async (entity) => {
              if (deleteProps.onSuccess) await deleteProps.onSuccess(entity);
              props.onOpenChange(false);
              toast.success("Registro eliminado", {
                description: "El registro se ha eliminado correctamente",
              });
              props.crudApi.refreshTable();
            }}
          />
        ),
      });
    }
    
    return [
      ...defaultActions,
      ...entityActions
    ];
    
  }, [updateProps, deleteProps, entityActions]);
}

function Filter<TEntity>({
  column,
  filters
}: Readonly<{
  column: Column<TEntity>
  filters: NonNullable<ColumnMeta<TEntity>["filters"]>;
}>) {
  
  const [value, setValue] = [column.getFilterValue(), column.setFilterValue]
  const [debounceValue, setDebounceValue] = useState(value);
  
  const debounceTime: number | undefined = filters.debounce;
  
  useEffect(() => {
    if (!debounceTime) {
      setValue(debounceValue);
      return;
    }
    const handler = setTimeout(() => {
      setValue((prev: unknown) => {
        if (prev === debounceValue) return prev;
        return debounceValue;
      });
    }, debounceTime);
    
    return () => clearTimeout(handler);
  }, [debounceTime, debounceValue, setValue]);
  
  return (
    <filters.component
      value={debounceValue}
      setValue={setDebounceValue}
    />
  );
}