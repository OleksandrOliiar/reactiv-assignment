/** Indexes of ids that repeat an earlier entry. The first occurrence is kept. */
export function duplicateIdIndexes(ids: readonly string[]): number[] {
  const seen = new Set<string>();
  const duplicates: number[] = [];

  ids.forEach((id, index) => {
    if (seen.has(id)) {
      duplicates.push(index);
      return;
    }
    seen.add(id);
  });

  return duplicates;
}
