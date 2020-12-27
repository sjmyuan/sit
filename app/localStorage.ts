import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';

export function saveToStorage<A>(key: string, value: A): E.Either<Error, void> {
  return pipe(
    E.stringifyJSON(value, E.toError),
    E.chain((x) => E.tryCatch(() => localStorage.setItem(key, x), E.toError))
  );
}
export function getFromStorage<A>(key: string): E.Either<Error, A> {
  return pipe(
    E.tryCatch(() => localStorage.getItem(key), E.toError),
    E.chain((x) => E.fromNullable(new Error(String(`${key} not found`)))(x)),
    E.chain((x) => E.parseJSON(x, E.toError)),
    E.map((x) => (x as unknown) as A)
  );
}
