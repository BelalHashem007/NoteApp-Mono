export function getAllUserTagsFromFoldersCache(cached: unknown): Tag[] {
  const tags = (cached as { data?: { tags?: Tag[] | null } })?.data?.tags;
  if (!tags || !Array.isArray(tags)) return [];
  return tags;
}

export function tagNameEquals(a: string[], b: string) {
  return a.some((tag) => tag.trim().toLowerCase() === b.trim().toLowerCase());
}
