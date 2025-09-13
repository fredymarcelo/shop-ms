/**
 * Este archivo define un sistema desacoplado para construir componentes CRUD headless.
 * Permite separar la lógica del formulario, tabla y acciones de los estilos o la UI.
 *
 * Ventajas:
 * - Completamente reutilizable entre diseños (ShadCN, MUI, Tailwind, etc.)
 * - Compatible con React Hook Form y TanStack Table
 * - Fácil de testear y mantener
 */
/**
 * Este archivo define un sistema desacoplado para construir componentes CRUD headless.
 * Permite separar la lógica del formulario, tabla y acciones de los estilos o la UI.
 *
 * Ventajas:
 * - Completamente reutilizable entre diseños (ShadCN, MUI, Tailwind, etc.)
 * - Compatible con React Hook Form y TanStack Table
 * - Fácil de testear y mantener
 */
import type {ComponentType, ReactNode, Ref} from "react";
import type {Creatable, Deletable, Entity, Findable, Pageable, Updatable} from "@/lib/crud";
import type {DefaultValues, FieldValues, Resolver, UseFormReturn} from "react-hook-form";
import type {ColumnDef, ColumnFilter, RowData, TableState} from "@tanstack/react-table";


/**
 * Props utilizadas en una acción sobre una entidad, como edición o eliminación.
 *
 * @template TEntity Tipo de la entidad
 */
export type EntityActionProps<TEntity extends Entity<ID>, ID> = {
  /** Entidad actual sobre la que se ejecuta la acción */
  entity: TEntity;
  
  /** API que permite interactuar con la tabla de entidades */
  crudApi: EntityCrudApi<TEntity>;
  
  /** Indica si el modal o acción está activa (visible) */
  open: boolean;
  
  /** Función para actualizar el estado abierto/cerrado */
  onOpenChange: (open: boolean) => void;
}

/**
 * Representa una acción disponible sobre una entidad (por ejemplo: ver detalles, editar, eliminar).
 *
 * Puede ser una acción directa con `onClick`, o una acción personalizada con un componente visual.
 *
 * @template TEntity Tipo de la entidad
 * @template ID Tipo del identificador de la entidad
 */
export type EntityAction<TEntity extends Entity<ID>, ID = TEntity['id']> =
  | {
    
    /** Identificador único de la acción, usado para distinguirla en la UI */
    id: string;
    /** Texto visible de la acción (por ejemplo, "Editar") */
    label: string | ((entity: TEntity) => string);
    
    /** Icono asociado a la acción (puede ser de una librería como Lucide o Material Icons) */
    icon: ReactNode | ((entity: TEntity) => ReactNode);
    
    /** Indica si la acción está habilitada; si es una función, se evalúa con la entidad actual */
    enabled?: (entity: TEntity) => boolean;
  }
  & ({
  /** Componente visual que ejecuta la acción personalizada (por ejemplo, un modal) */
  actionComponent: ComponentType<EntityActionProps<TEntity, ID>>;
} | {
  
  /** Ocultar estado de carga dentro de la acción */
  hideLoading?: boolean;
  
  /** Función a ejecutar cuando se selecciona esta acción */
  onClick: (entity: TEntity, crudApi: EntityCrudApi<TEntity>) => (void | Promise<void>);
});

/**
 * Propiedades compartidas para formularios de creación o edición de entidades.
 *
 * @template TEntity Tipo de la entidad
 * @template Dto Tipo de los datos del formulario (valores controlados por react-hook-form)
 */
export interface EntityFormProps<TEntity extends Entity<ID>, Dto extends FieldValues, ID = TEntity['id']> {
  /** Entidad existente a editar; si no se proporciona, se asume que es una creación */
  entity?: TEntity;
  
  /** Objeto de React Hook Form para gestionar el formulario */
  form: UseFormReturn<Dto>;
  
  /** Función para cerrar el formulario manualmente (por ejemplo, cerrar un modal en caso de estar contenido en uno) */
  close: () => void;
  
  crudApi: EntityCrudApi<TEntity>;
}


/**
 * API expuesta por un componente `EntityCrud` para permitir acciones programáticas desde el exterior.
 *
 * @template TEntity Tipo de la entidad
 * @template ID Tipo del identificador
 */
export interface EntityCrudApi<TEntity extends Entity<ID>, ID = TEntity['id']> {
  /** Lista de entidades actualmente mostradas en la tabla */
  entities: readonly TEntity[] | undefined;
  
  /** Reemplaza una entidad específica por otra (útil tras una actualización local) */
  replaceEntity: (entity: TEntity) => void;
  
  /**
   * Refresca la información de una entidad específica consultando la fuente de datos (por ID).
   * @returns La entidad actualizada
   */
  refreshEntity: (id: ID) => Promise<TEntity>;
  
  /**
   * Refresca la tabla completa, actualizando el estado de las entidades.
   * @returns Void
   * */
  refreshTable: () => void;
  
}


/**
 * Propiedades necesarias para el componente de creación de entidades.
 *
 * Extiende `EntityCreateProps`, omitiendo la propiedad `cacheKey`.
 *
 * @template TEntity Tipo de la entidad
 * @template ID Tipo del identificador
 * @template Dto Tipo de los datos del formulario
 */
export interface CreateProps<
  TEntity extends Entity<ID>,
  Dto extends FieldValues,
  ID = TEntity['id']
> {
  /** Acción para crear una nueva entidad */
  createAction: Creatable<TEntity, Dto>['create'];
  
  /** Indica si el formulario de creación está habilitado; si es una función, se evalúa dinámicamente */
  enabled?: boolean;
  
  /** Función que resuelve el esquema del formulario, permitiendo validaciones dinámicas */
  resolver: () => Resolver<Dto>;
  
  /** Valores por defecto del formulario, que no dependen de una entidad específica */
  defaultValues: () => DefaultValues<Dto>;
  
  
  /** Componente que renderiza el formulario de creación */
  renderForm: ComponentType<{
    form: UseFormReturn<Dto>;
    close: () => void
    crudApi: EntityCrudApi<TEntity>;
  }>;
  
  /** Callback que se ejecuta al completar la creación con éxito */
  onSuccess?: (entity: TEntity) => (void | Promise<void>);
}

/**
 * Propiedades necesarias para el componente de lectura (tabla) de entidades.
 *
 * Extiende `EntityReadProps`, omitiendo la propiedad `cacheKey`.
 *
 * @template TEntity Tipo de la entidad
 * @template ID Tipo del identificador
 * @template TFilter Tipo del objeto de filtro
 */
export interface ReadProps<TEntity extends Entity<ID>, ID = TEntity['id']> {
  
  /** Acción para paginar las entidades */
  pageAction: Pageable<TEntity>['page'];
  
  /** Acción para buscar entidades por ID */
  findAction: Findable<TEntity, ID>['find'];
  
  /** Columnas de la tabla, definidas con TanStack Table */
  columns: ColumnDef<TEntity>[];
  
  /** Función que convierte los filtros de columna en una cadena de consulta en el formato esperado por la pageAction */
  toQuery?: (columnFilters: ColumnFilter[]) => string;
  
  /** Estado inicial de la tabla, incluyendo paginación, ordenamiento, filtros y búsqueda */
  initialState?: Partial<TableState>;
  
  /** Lista de acciones disponibles para cada entidad de la tabla */
  entityActions?: EntityAction<TEntity, ID>[];
}

/**
 * Propiedades necesarias para el componente de edición de entidades.
 *
 * Extiende `EntityUpdateProps`, omitiendo la propiedad `entity`, que será pasada directamente al formulario.
 *
 * @template TEntity Tipo de la entidad
 * @template ID Tipo del identificador
 * @template Dto Tipo de los datos del formulario
 */
export interface UpdateProps<
  TEntity extends Entity<ID>,
  Dto extends FieldValues,
  ID = TEntity['id']
> {
  /** Acción para actualizar la entidad */
  updateAction: Updatable<TEntity, Dto, ID>['update'];
  
  enabled?: (entity: TEntity) => boolean;
  
  /** Función que resuelve el esquema del formulario, permitiendo validaciones dinámicas */
  resolver: (entity: TEntity) => Resolver<Dto>;
  
  /** Valores por defecto del formulario, que pueden depender de la entidad */
  defaultValues: (entity: TEntity) => DefaultValues<Dto>;
  
  /** Callback que se ejecuta al completar la actualización con éxito */
  onSuccess?: (entity: TEntity) => (void | Promise<void>);
  /** Componente que renderiza el formulario de actualización */
  renderForm: ComponentType<{
    form: UseFormReturn<Dto>;
    crudApi: EntityCrudApi<TEntity>;
    entity: TEntity;
    close: () => void;
  }>;
}

/**
 * Propiedades necesarias para el componente de eliminación de entidades.
 *
 * Extiende `EntityDeleteProps`, omitiendo la propiedad `entity` que se inyecta dinámicamente al eliminar.
 *
 * @template TEntity Tipo de la entidad
 * @template ID Tipo del identificador
 */
export interface DeleteProps<TEntity extends Entity<ID>, ID = TEntity['id']> {
  /** Acción para eliminar la entidad */
  deleteAction: Deletable<ID>['delete'];
  
  
  enabled?: (entity: TEntity) => boolean;
  
  /** Callback que se ejecuta al completar la eliminación con éxito */
  onSuccess?: (entity: TEntity) => (void | Promise<void>);
}

type DeepOmit<T, TFilter> = {
  [K in keyof T as K extends keyof TFilter
    ? TFilter[K] extends true
      ? never
      : K
    : K]: K extends keyof TFilter
    ? TFilter[K] extends true
      ? never
      : DeepOmit<T[K], TFilter[K]>
    : T[K];
};


/**
 * Propiedades para configurar un CRUD desacoplado para una entidad específica.
 *
 * Puedes definir solo las operaciones necesarias: si no deseas permitir eliminación, omite la propiedad `delete`.
 *
 * @template TEntity Tipo de la entidad
 * @template ID Tipo del identificador
 * @template Dto Tipo de los valores del formulario
 * @template TFilter Tipo del filtro
 */
export interface EntityCrudProps<
  TEntity extends Entity<ID>,
  Dto extends FieldValues,
  ID = TEntity['id']
> {
  /** Clave de caché usada por React Query */
  cacheKey: string;
  
  /** API que permite interactuar con las operaciones CRUD de la entidad */
  apiRef?: Ref<EntityCrudApi<TEntity>>;
  
  /** Configuración para la operación de creación */
  create?: CreateProps<TEntity, Dto>;
  
  /** Configuración para la operación de lectura (tabla principal) */
  read: ReadProps<TEntity>;
  
  /** Configuración para la operación de edición */
  enabled?: (entity: TEntity) => boolean;
  
  /** Configuración para la operación de actualización */
  update?: UpdateProps<TEntity, Dto>;
  
  /** Configuración para la operación de eliminación */
  delete?: DeleteProps<TEntity>;
}

export type EntityCrudPropsWithCustomProps<
  TEntity extends Entity<ID>,
  Dto extends FieldValues,
  ID = TEntity['id'],
  Props extends object = object
> = EntityCrudProps<TEntity, Dto, ID> & DeepOmit<Props, EntityCrudProps<TEntity, Dto, ID>>;


declare module "@tanstack/react-table" {
  
  export type ColumnFilterComponentProps<TFilter> = {
    value: TFilter | undefined;
    setValue: (value: TFilter | undefined) => void;
  }
  
  
  interface ColumnMeta<TData extends RowData, TValue = unknown> {
    filters?: {
      debounce?: number;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component: ComponentType<ColumnFilterComponentProps<any>>;
    };
    
    /** Dummy use of generics to avoid unused warnings */
    ______?: TData | TValue;
  }
}