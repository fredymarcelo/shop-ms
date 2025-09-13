import {AlertCircleIcon, Check, ChevronsUpDown, Loader2, XIcon} from 'lucide-react';
import {cn} from '@/lib/utils';
import {Button} from '@/components/ui/button';
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem} from '@/components/ui/command';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {ScrollArea} from '@/components/ui/scroll-area';
import React, {ComponentProps, PropsWithChildren, useCallback, useEffect, useState} from 'react';
import type {ClassValue} from 'clsx';
import {Page} from "@/lib/crud";
import {AwaitResult, unwrap} from "@/lib/result";
import {ErrorDescription, parseError} from "@/lib/errors";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {useQuery} from "@tanstack/react-query";


/**
 * Opción representada en el combobox.
 */
type ComboboxOption = {
  /** Valor único (clave interna) */
  value: string;
  /** Etiqueta mostrada al usuario */
  label: string;
};

const popOverStyles = {
  width: 'var(--radix-popover-trigger-width)',
};

/**
 * Valores permitidos como seleccionables en el combobox.
 */
type Serializable = number | string | boolean | undefined | null | symbol | object;

/**
 * Props base para el componente `ComboboxBase`, que sirve como base para los componentes locales, remotos o con query.
 *
 * @template T Tipo del valor seleccionable (serializable)
 */
interface ComboboxBaseProps<T extends Serializable> {
  /**
   * Valor actualmente seleccionado.
   * Puede ser un valor literal o una función que determine si un ítem de la lista es el seleccionado.
   */
  value: T | null | ((item: T) => boolean);
  
  /**
   * Callback al seleccionar un valor.
   * Usar `null` para deseleccionar.
   */
  onSelect: (value: T | null) => void;
  
  /**
   * Lista de ítems mostrados en el combobox.
   */
  items: T[];
  
  /**
   * Filtro adicional para aplicar sobre los ítems.
   */
  filter?: (item: T) => boolean;
  
  /**
   * Lista de ítems fijos que se anteponen a la lista principal.
   */
  fixedItems?: T[];
  
  /**
   * Convierte un ítem a su opción visual.
   */
  toOption: (item: T) => ComboboxOption;
  
  /**
   * Función de comparación entre el valor seleccionado y un ítem.
   * Por defecto usa `===`.
   */
  compare?: (selectedValue: T, itemValue: T) => boolean;
  
  /** Placeholder del input de búsqueda */
  searchPlaceholder?: string;
  
  /** Texto mostrado si no hay resultados */
  noResultsText?: string;
  
  /** Texto o contenido mostrado si no hay selección */
  pleceholder?: string;
  
  /** Clase adicional para el botón del combobox */
  className?: ClassValue;
  
  /**
   * Nombre del combobox, usado para accesibilidad y pruebas.
   */
  name?: string;
  
  /**
   * ID del combobox, usado para accesibilidad y pruebas.
   */
  id?: string;
  
  /** Tiempo de debounce para búsquedas */
  debounceTime?: number;
  
  /** Texto mostrado durante la carga */
  loadingText?: string;
  
  /** Indica si se está cargando */
  loading: boolean;
  
  /** Error recibido durante la carga */
  error: ErrorDescription | null;
  
  /** Callback llamado tras el debounce al escribir en búsqueda */
  onSearchDebounce?: (search: string) => void;
  
  /** Si el combobox está abierto */
  open: boolean;
  
  /** Callback para abrir o cerrar el combobox */
  onOpenChange: (open: boolean) => void;
}

function ComboboxBase<T extends Serializable>({
  value,
  onSelect,
  items,
  filter,
  fixedItems,
  toOption,
  compare = (selectedValue, itemValue) => selectedValue === itemValue,
  searchPlaceholder = 'Buscar',
  noResultsText = 'No hay resultados',
  pleceholder = 'Seleccionar',
  className,
  debounceTime = 500,
  loadingText = 'Cargando...',
  loading = false,
  error = null,
  onSearchDebounce,
  open,
  onOpenChange,
  name,
  id
}: Readonly<ComboboxBaseProps<T>>) {
  
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    if (!onSearchDebounce) return;
    const handler = setTimeout(() => onSearchDebounce(search), debounceTime);
    return () => clearTimeout(handler);
  }, [debounceTime, onSearchDebounce, search]);
  
  const handleUnselect = (e: React.SyntheticEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onSelect(null);
  };
  
  const handleSelect = (item: T) => {
    onSelect(item);
    onOpenChange(false);
  };
  
  const [selected, renderItems] = resolveItems(
    items,
    fixedItems,
    value,
    compare,
    filter
  );
  
  return (
    <Popover open={open} onOpenChange={onOpenChange} modal={true}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant='outline'
          type='button'
          aria-expanded={open}
          className={cn('justify-between', className)}
        >
          {selected ? toOption(selected).label : <p className='text-muted-foreground text-sm'>{pleceholder}</p>}
          {selected ? <XCircle onClick={handleUnselect}/> : <ChevronsUpDown className='h-4 w-4'/>}
        </Button>
      </PopoverTrigger>
      <PopoverContent style={popOverStyles} className='p-0'>
        <Command>
          <CommandInput
            name={name}
            value={search}
            placeholder={searchPlaceholder}
            onValueChange={setSearch}
          />
          <ScrollArea className='max-h-[220px] overflow-auto'>
            <CommandFallback
              loading={loading}
              loadingText={loadingText}
              error={error}
            >
              <CommandEmpty>{noResultsText}</CommandEmpty>
              <CommandGroup>
                {renderItems.map(item => {
                  const option = toOption(item);
                  return (<CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(item)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        item === selected ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {option.label}
                  </CommandItem>);
                })}
              </CommandGroup>
            </CommandFallback>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Props para el `Combobox` local (sin datos remotos).
 */
export type ComboboxProps<T extends Serializable> = Omit<ComboboxBaseProps<T>,
  'debounceTime' |
  'loadingText' |
  'loading' |
  'error' |
  'onSearchDebounce' |
  'open' |
  'onOpenChange'
>;


export function Combobox<T extends Serializable>(props: Readonly<ComboboxProps<T>>) {
  
  const [open, setOpen] = useState(false);
  
  return (
    <ComboboxBase<T>
      open={open}
      onOpenChange={setOpen}
      {...props}
      loading={false}
      error={null}
    />
  )
}

/**
 * Props internas utilizadas por `ComboboxRemote` y `ComboboxQuery`.
 * Este tipo omite propiedades que son manejadas internamente como el estado de carga, apertura y errores.
 *
 * @template T Tipo del valor seleccionable (serializable)
 */
type ComboboxInternalStateProps<T extends Serializable> = Omit<ComboboxBaseProps<T>,
  'items' |
  'loading' |
  'error' |
  'onSearchDebounce' |
  'open' |
  'onOpenChange'
>

/**
 * Props para `ComboboxRemote`, que obtiene ítems desde una función asincrónica.
 */
export interface ComboboxRemoteProps<T extends Serializable> extends ComboboxInternalStateProps<T> {
  /**
   * Función que obtiene ítems de forma asincrónica.
   * El string es el término de búsqueda.
   */
  fetchItems: (search?: string) => Promise<T[]>;
}

export function ComboboxRemote<T extends Serializable>({fetchItems, ...props}: Readonly<ComboboxRemoteProps<T>>) {
  
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorDescription | null>(null);
  const [debounceSearch, setDebounceSearch] = useState("");
  
  const fetch = useCallback(() => {
    setLoading(true);
    fetchItems(debounceSearch)
    .then(async (items) => {
      setItems(items);
      setError(null);
    })
    .catch((err) => setError(parseError(err)))
    .finally(() => setLoading(false));
  }, [fetchItems, debounceSearch]);
  
  useEffect(() => {
    if (open) fetch();
  }, [fetch, open]);
  
  return (
    <ComboboxBase<T>
      items={items}
      loading={loading}
      error={error}
      onSearchDebounce={setDebounceSearch}
      open={open}
      onOpenChange={setOpen}
      {...props}
    />
  );
}


/**
 * Props para `ComboboxQuery`, que usa React Query para obtener ítems.
 */
export interface ComboboxQueryProps<T extends Serializable> extends ComboboxInternalStateProps<T> {
  /**
   * Clave de la consulta, que se combinará con el texto buscado.
   */
  queryKey: readonly unknown[];
  
  /**
   * Función de consulta que retorna una lista de ítems.
   */
  queryFn: (search?: string) => Promise<T[]>;
}

export function ComboboxQuery<T extends Serializable>({queryKey, queryFn, ...props}: Readonly<ComboboxQueryProps<T>>) {
  
  const [open, setOpen] = useState(false);
  const [debounceSearch, setDebounceSearch] = useState("");
  
  const query = useQuery<T[]>({
    queryKey: [...queryKey, debounceSearch],
    queryFn: async () => await queryFn(debounceSearch),
    enabled: open,
    placeholderData: [],
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  
  const items = query.data;
  const loading = query.isLoading || query.isFetching;
  const error = query.error ? parseError(query.error) : null;
  
  return (
    <ComboboxBase<T>
      items={items ?? []}
      loading={loading}
      error={error}
      onSearchDebounce={setDebounceSearch}
      open={open}
      onOpenChange={setOpen}
      {...props}
    />
  );
  
}

function CommandFallback({
  children,
  loading,
  loadingText,
  error,
}: Readonly<PropsWithChildren<{
  loading: boolean;
  loadingText: string;
  error: ErrorDescription | null;
}>>) {
  
  if (loading) {
    return (
      <CommandEmpty>
        <Loader2 className='mx-auto animate-spin h-8 w-8'/>
        {loadingText}
      </CommandEmpty>
    );
  }
  
  if (error) {
    return (
      <CommandEmpty>
        <Alert variant='destructive' className='mt-4'>
          <AlertCircleIcon/>
          <AlertTitle>{error.title}</AlertTitle>
          <AlertDescription>
            {error.description}
          </AlertDescription>
        </Alert>
      </CommandEmpty>
    );
  }
  
  return children;
}

/// Resuelve la lista de items a mostrar en el combobox,
function resolveItems<T extends Serializable>(
  items: T[],
  fixedItems: T[] | undefined,
  value: T | null | ((item: T) => boolean),
  compare: (selectedValue: T, itemValue: T) => boolean,
  filter?: (item: T) => boolean,
): [T | null, T[]] {
  
  // Aqui se resuelve la lista de items a mostrar en el combobox.
  let resolved: T[] = items;
  
  // Si hay algún elemento seleccionado, y este no está en la lista de items, se agrega al inicio.
  if (value != null && typeof value !== 'function' && !resolved.some(item => compare(item, value))) {
    resolved = [
      value,
      ...resolved
    ];
  }
  
  // Si hay elementos fijados, se agregan al inicio de la lista, evitando duplicados.
  if (fixedItems) {
    resolved = [
      ...fixedItems.filter(item => !resolved.some(i => compare(i, item))),
      ...resolved
    ];
  }
  
  // Si hay un filtro, se aplica a la lista de items.
  if (filter) {
    resolved = resolved.filter(filter);
  }
  
  // Obtenemos el comparador para encontrar el item seleccionado, si value es una función, se usa como tal, si no, se compara con el comparador.
  const comparator = typeof value === "function"
    ? (item: T) => value(item)
    : (item: T) => isSelectedItem(item, value, compare);
  
  const selected: T | null = resolved.find(comparator) ?? null;
  
  return [selected, resolved];
}

function isSelectedItem<T extends Serializable>(
  item: T,
  value: T | null,
  compare: (selectedValue: T, itemValue: T) => boolean,
) {
  if (!value) return false;
  return compare(item, value);
}

function XCircle({className, ...props}: Readonly<ComponentProps<"div">>) {
  return <div
    className={cn("p-1 hover:bg-primary hover:text-primary-foreground rounded-full hover:animate-pulse", className)}
    {...props}
  >
    <XIcon className="h-4 w-4 opacity-50 hover:opacity-100"/>
  </div>;
}

/**
 * Crea una función de consulta para `ComboboxQuery` o `ComboboxRemote`
 * a partir de una función que retorna una página.
 *
 * @param getPage Función que retorna una `Page<T>` dentro de un `AwaitResult`.
 * @returns Función que retorna `Promise<T[]>`
 */
export function fromPage<T>(getPage: (search?: string) => AwaitResult<Page<T>>): (string?: string) => Promise<T[]> {
  return async (search?: string) => unwrap(await getPage(search)).content
}