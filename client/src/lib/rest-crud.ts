import type {Countable, Creatable, CrudOperations, Deletable, Entity, Existable, Findable, Page, Pageable, PageQuery, PageQueryBase, ReadOperations, TypeCrudOperations, TypeReadOperation, TypeWriteOperation, Updatable, WriteOperations} from "@/lib/crud";
import {Axios, type AxiosRequestConfig} from "axios";
import {parseError, parseErrorOrValidationErrors} from "@/lib/errors";
import {fail, succeed} from "./result";


export type Converter<Source, Target> = (src: Source) => Target;

interface WithOptionRequestConfig<T> {
  requestConfig?: (options: T) => Promise<AxiosRequestConfig> | AxiosRequestConfig;
}

interface WithRequestConfig {
  requestConfig?: (() => Promise<AxiosRequestConfig> | AxiosRequestConfig) | AxiosRequestConfig;
}

export type ReadableConfig<TEntity> = {
  entityConverter?: Converter<unknown, TEntity>;
}

export type WriteableConfig<TEntity, Dto> = ReadableConfig<TEntity> & {
  dtoConverter?: Converter<Dto, unknown>;
};

export type RestReadConfig<TEntity> = ReadableConfig<TEntity> & WithOptionRequestConfig<TypeReadOperation>;

export type RestWriteConfig<TEntity, Dto> = WriteableConfig<TEntity, Dto> & WithOptionRequestConfig<TypeWriteOperation>;

export type RestCrudConfig<TEntity, Dto> = ReadableConfig<TEntity> & WriteableConfig<TEntity, Dto> & WithOptionRequestConfig<TypeCrudOperations>;


const getEmpty = () => ({});

export function pageQueryToParamsBase({search, query}: PageQueryBase): URLSearchParams {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (query) params.append("query", query);
  return params;
}

export function pageQueryToParams({page, size, sorts, ...base}: PageQuery): URLSearchParams {
  const params = pageQueryToParamsBase(base);
  if (page) params.append("page", page.toString());
  if (size) params.append("size", size.toString());
  if (sorts) {
    for (const sort of sorts) {
      params.append("sort", sort.property + "," + sort.direction);
    }
  }
  return params;
}


async function getRequestConfig(config?: WithRequestConfig["requestConfig"]): Promise<AxiosRequestConfig> {
  if (!config) return {};
  if (typeof config === "function") {
    return config();
  }
  return config;
}

export function restPageable<TEntity>(axios: Axios, resource: string, config: ReadableConfig<TEntity> & WithRequestConfig = {}): Pageable<TEntity> {
  const {entityConverter, requestConfig} = config
  return {
    async page(query: PageQuery) {
      try {
        const config = await getRequestConfig(requestConfig);
        const {data} = await axios.get<Page<TEntity>>(resource, {
          params: pageQueryToParams(query),
          ...config
        });
        const page = entityConverter ? {...data, content: data.content.map(entityConverter)} : data;
        return succeed(page);
      } catch (error) {
        return fail(parseError(error))
      }
    }
  }
}


export function restFindable<TEntity extends Entity<ID>, ID = TEntity["id"]>(axios: Axios, resource: string, config: ReadableConfig<TEntity> & WithRequestConfig = {}): Findable<TEntity> {
  const {entityConverter, requestConfig} = config
  return {
    async find(id: ID) {
      try {
        const config = await getRequestConfig(requestConfig);
        const {data} = await axios.get<TEntity>(`${resource}/${id}`, config);
        const entity = entityConverter ? entityConverter(data) : data;
        return succeed(entity);
      } catch (error) {
        return fail(parseError(error));
      }
    },
    async findMany(ids: ID[]) {
      try {
        const config = await getRequestConfig(requestConfig);
        const {data} = await axios.get<TEntity[]>(`${resource}/ids`, {
          params: new URLSearchParams({ids: ids.join(',')}),
          ...config
        });
        const entities = entityConverter ? data.map(entityConverter) : data;
        return succeed(entities);
      } catch (error) {
        return fail(parseError(error));
      }
    }
  }
}

export function restCountable(axios: Axios, resource: string, config: WithRequestConfig = {}): Countable {
  const {requestConfig} = config;
  return {
    async count(query) {
      try {
        const config = await getRequestConfig(requestConfig);
        const {data} = await axios.get<number>(`${resource}/count`, {
          params: pageQueryToParamsBase(query),
          ...config
        });
        return succeed(data);
      } catch (error) {
        return fail(parseError(error));
      }
    }
  }
}

export function restExistable<ID>(axios: Axios, resource: string, config: WithRequestConfig = {}): Existable<ID> {
  return {
    async exist(id: ID) {
      try {
        const response = await axios.get<boolean>(`${resource}/exist/${id}`, await getRequestConfig(config.requestConfig));
        return succeed(response.data);
      } catch (error) {
        return fail(parseError(error));
      }
    }
  }
}


export function restCreatable<TEntity, Dto>(axios: Axios, resource: string, config: WriteableConfig<TEntity, Dto> & WithRequestConfig = {}): Creatable<TEntity, Dto> {
  const {dtoConverter, entityConverter, requestConfig} = config;
  return {
    async create(dto: Dto) {
      try {
        const config = await getRequestConfig(requestConfig);
        const {data} = await axios.post<TEntity>(resource, dtoConverter ? dtoConverter(dto) : dto, config);
        const entity = entityConverter ? entityConverter(data) : data;
        return succeed(entity);
      } catch (error) {
        return fail(parseErrorOrValidationErrors(error));
      }
    }
  }
}

export function restUpdatable<TEntity extends Entity<ID>, Dto, ID = TEntity["id"]>(axios: Axios, resource: string, config: WriteableConfig<TEntity, Dto> & WithRequestConfig = {}): Updatable<TEntity, Dto> {
  const {dtoConverter, entityConverter, requestConfig} = config;
  return {
    async update(id: ID, dto: Dto) {
      try {
        const config = await getRequestConfig(requestConfig);
        const {data} = await axios.put<TEntity>(`${resource}/${id}`, dtoConverter ? dtoConverter(dto) : dto, config);
        const entity = entityConverter ? entityConverter(data) : data;
        return succeed(entity);
      } catch (error) {
        return fail(parseErrorOrValidationErrors(error));
      }
    }
  }
}

export function restDeleteable<ID>(axios: Axios, resource: string, config: WithRequestConfig = {}): Deletable<ID> {
  return {
    async delete(id: ID) {
      try {
        await axios.delete<void>(`${resource}/${id}`, await getRequestConfig(config.requestConfig));
        return succeed();
      } catch (error) {
        return fail(parseError(error));
      }
    }
  }
}


function toRequestConfig<T>(config: WithOptionRequestConfig<T>["requestConfig"] | undefined, options: T): WithRequestConfig["requestConfig"] {
  if (!config) return {};
  if (typeof config === "function") {
    return async () => config(options)
  }
  return config;
}

export function restRead<TEntity extends Entity<ID>, ID = TEntity["id"]>(axios: Axios, resource: string, config: RestReadConfig<TEntity> = {}): ReadOperations<TEntity, ID> {
  
  const {entityConverter, requestConfig} = config;
  
  const pageable = restPageable<TEntity>(axios, resource, {
    entityConverter,
    requestConfig: toRequestConfig(requestConfig, "page")
  });
  
  const findable = restFindable<TEntity, ID>(axios, resource, {
    entityConverter,
    requestConfig: toRequestConfig(requestConfig, "find")
  });
  
  const countable = restCountable(axios, resource, {
    requestConfig: toRequestConfig(requestConfig, "count")
  });
  
  const existable = restExistable<ID>(axios, resource, {
    requestConfig: toRequestConfig(requestConfig, "exist")
  });
  
  return {
    ...pageable,
    ...findable,
    ...countable,
    ...existable,
  };
}


export function restWrite<TEntity extends Entity<ID>, Dto, ID = TEntity["id"]>(axios: Axios, resource: string, config: RestWriteConfig<TEntity, Dto> = {}): WriteOperations<TEntity, Dto, ID> {
  
  const {dtoConverter, entityConverter, requestConfig = getEmpty} = config;
  
  const creatable = restCreatable<TEntity, Dto>(axios, resource, {
    dtoConverter,
    entityConverter,
    requestConfig: toRequestConfig(requestConfig, "create")
  });
  
  const updatable = restUpdatable<TEntity, Dto, ID>(axios, resource, {
    dtoConverter, entityConverter,
    requestConfig: toRequestConfig(requestConfig, "update")
  });
  
  const deleteable = restDeleteable<ID>(axios, resource, {
    requestConfig: toRequestConfig(requestConfig, "delete")
  });
  
  return {
    ...creatable,
    ...updatable,
    ...deleteable,
  };
}

export function restCrud<TEntity extends Entity<ID>, Dto, ID = TEntity["id"]>(axios: Axios, resource: string, config: RestCrudConfig<TEntity, Dto> = {}): CrudOperations<TEntity, Dto, ID> {
  
  const {dtoConverter, entityConverter, requestConfig = getEmpty} = config;
  
  const read = restRead<TEntity>(axios, resource, {entityConverter, requestConfig});
  const write = restWrite<TEntity, Dto>(axios, resource, {dtoConverter, entityConverter, requestConfig});
  
  return {
    ...read,
    ...write,
  };
}