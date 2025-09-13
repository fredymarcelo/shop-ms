import {type ErrorDescription, parseError} from "./errors";

export type Failure<E = unknown> = {
  success: false;
  error: E;
};

export type Success<T = void> = {
  success: true;
  data: T;
};

export type Result<T = void, E = unknown> = Failure<E> | Success<T>;
export type AwaitResult<T = void, E = unknown> = Promise<Result<T, E>>;

export function succeed(): Success;
export function succeed<T>(data: T): Success<T>;
export function succeed<T>(data?: T): Success<T | undefined> {
  return {success: true, data};
}

export function fail<E = unknown>(error: E): Failure<E> {
  return {success: false, error};
}

export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.success) return result.data;
  throw result.error;
}

type AttemptCallbacks<T> = (() => Promise<T>) | (() => T);

export function attempt<T>(callback: () => Promise<T>): AwaitResult<T, ErrorDescription>;
export function attempt<T, E>(callback: () => Promise<T>, parser: (error: unknown) => E): AwaitResult<T, E>;
export function attempt<T>(callback: () => T): Result<T, ErrorDescription>;
export function attempt<T, E>(callback: () => T, parser: (error: unknown) => E): Result<T, E>;
export function attempt<T, E>(
  callback: AttemptCallbacks<T>,
  parser: (error: unknown) => E = parseError as (error: unknown) => E
): Result<T, E> | AwaitResult<T, E> {
  const result = callback();
  if (result instanceof Promise) {
    return result
    .then(succeed<T>)
    .catch((error) => fail(parser(error)));
  }
  try {
    return succeed(result);
  } catch (error) {
    return fail(parser(error));
  }
}
