/** Appends `?tag=…` when `tag` is non-empty (for note links / tab navigation). */
export function tagQuerySuffix(tags: string[]): string {
  console.log("tags", tags);
  if (tags.length === 0) return "";
  return `?tag=${tags.map((t) => encodeURIComponent(t)).join("&tag=")}`;
}
