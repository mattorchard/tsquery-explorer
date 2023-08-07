export const isOneOf = <T>(filter: Iterable<T>) => {
  const set = new Set(filter);
  return (item: T) => set.has(item);
};

export const isNotOneOf = <T>(filter: Iterable<T>) => {
  const set = new Set(filter);
  return (item: T) => !set.has(item);
};

// Can be used in a filter to narrow type definitions
export const isNotNullish = <T>(value: T | null | undefined): value is T =>
  value != null;
