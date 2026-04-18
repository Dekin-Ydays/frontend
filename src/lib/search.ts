export function filterByQuery<T>(
  items: T[],
  query: string,
  getFields: ((item: T) => string) | ((item: T) => string)[],
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  const fields = Array.isArray(getFields) ? getFields : [getFields];
  return items.filter((item) =>
    fields.some((getField) => getField(item).toLowerCase().includes(q)),
  );
}
