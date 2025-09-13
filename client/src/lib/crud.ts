import type {ErrorDescription, ValidationError} from "@/lib/errors";
import type {AwaitResult} from "@/lib/result";

export type TypeReadOperation = 'page' | 'find' | 'count' | 'exist' | 'create';
export type TypeWriteOperation = 'create' | 'update' | 'delete';
export type TypeCrudOperations = TypeReadOperation | TypeWriteOperation;

export interface PageDetails {
  size: number;
  number: number;
  totalPages: number;
  totalElements: number;
}

export interface Entity<ID> {
  id: ID;
}

export interface Page<T> {
  content: T[];
  page: PageDetails;
}

export type Direction = "asc" | "desc";

export type Sort = {
  property: string;
  direction: Direction;
};

export interface PageQueryBase {
  search?: string;
  query?: string;
}

export interface PageQuery extends PageQueryBase {
  page?: number;
  size?: number;
  sorts?: Sort[];
}

export type Findable<TEntity extends Entity<ID>, ID = TEntity['id']> = {
  find: (id: ID) => AwaitResult<TEntity, ErrorDescription>;
  findMany: (ids: ID[]) => AwaitResult<TEntity[], ErrorDescription>;
};

export type Pageable<TEntity> = {
  page: (query: PageQuery) => AwaitResult<Page<TEntity>, ErrorDescription>
};

export type Countable = {
  count: (query: PageQueryBase) => AwaitResult<number, ErrorDescription>;
};

export type Existable<ID> = {
  exist: (id: ID) => AwaitResult<boolean, ErrorDescription>;
};

export type Creatable<TEntity, Dto> = {
  create: (dto: Dto) => AwaitResult<TEntity, ErrorDescription | ValidationError[]>;
};

export type Updatable<TEntity extends Entity<ID>, Dto, ID = TEntity['id']> = {
  update: (id: ID, dto: Dto) => AwaitResult<TEntity, ErrorDescription | ValidationError[]>;
};

export type Deletable<ID> = {
  delete: (id: ID) => AwaitResult<void, ErrorDescription>;
};

export type ReadOperations<
  TEntity extends Entity<ID>,
  ID = TEntity['id']
> = Findable<TEntity, ID>
  & Pageable<TEntity>
  & Countable
  & Existable<ID>;

export type WriteOperations<
  TEntity extends Entity<ID>,
  Dto,
  ID = TEntity['id']
> = Creatable<TEntity, Dto>
  & Updatable<TEntity, Dto>
  & Deletable<ID>;

export type CrudOperations<
  TEntity extends Entity<ID>,
  Dto,
  ID = TEntity['id']
> = ReadOperations<TEntity>
  & WriteOperations<TEntity, Dto>;


export function isPageable<TFilter>(operations: unknown): operations is Pageable<TFilter> {
  return (operations as Pageable<TFilter>).page !== undefined;
}

export function isFindable<TEntity extends Entity<ID>, ID>(operations: unknown): operations is Findable<TEntity, ID> {
  return (operations as Findable<TEntity, ID>).find !== undefined;
}

export function isCountable(operations: unknown): operations is Countable {
  return (operations as Countable).count !== undefined;
}

export function isExistable<ID>(operations: unknown): operations is Existable<ID> {
  return (operations as Existable<ID>).exist !== undefined;
}

export function isCreatable<TEntity, Dto>(operations: unknown): operations is Creatable<TEntity, Dto> {
  return (operations as Creatable<TEntity, Dto>).create !== undefined;
}

export function isUpdatable<TEntity extends Entity<ID>, Dto, ID>(operations: unknown): operations is Updatable<TEntity, Dto, ID> {
  return (operations as Updatable<TEntity, Dto, ID>).update !== undefined;
}

export function isDeletable<ID>(operations: unknown): operations is Deletable<ID> {
  return (operations as Deletable<ID>).delete !== undefined;
}

export function isReadOperations<TEntity extends Entity<ID>, ID>(operations: unknown): operations is ReadOperations<TEntity, ID> {
  return isFindable(operations) && isPageable(operations) && isCountable(operations) && isExistable(operations);
}

export function isWriteOperations<TEntity extends Entity<ID>, Dto, ID>(operations: unknown): operations is WriteOperations<TEntity, Dto, ID> {
  return isCreatable(operations) && isUpdatable(operations) && isDeletable(operations);
}

export function isCrudOperations<TEntity extends Entity<ID>, Dto, ID>(operations: unknown): operations is CrudOperations<TEntity, Dto, ID> {
  return isReadOperations(operations) && isWriteOperations(operations);
}

export function emptyPage<TEntity>(): Page<TEntity> {
  return {
    content: [],
    page: {
      size: 0,
      number: 0,
      totalPages: 0,
      totalElements: 0,
    },
  };
}
