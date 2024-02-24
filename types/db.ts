export type PatchResults<T> = {
  found: T;
  replaced: T;
}

export type DeleteResults<T> = {
  deleted: T;
}
