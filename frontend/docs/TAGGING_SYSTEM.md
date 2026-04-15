# Tagging system — handoff for agents

This document summarizes what is **done**, what is **left**, and where to look in the codebase. The original product goal: tags are **not** stored inside editor content; UI should feel fast (react-query, optimistic updates where applicable).

---

## Completed steps (1–3)

### Step 1 — Tag display

- **What**: Tag pills between note tabs and the TipTap toolbar; labels show `#name` as a visual hint only (stored name has no `#`).
- **Main files**:
  - [`views/DashboardView/NoteView.tsx`](views/DashboardView/NoteView.tsx) — renders `NoteTappedNavigation`, `NoteTagsRow`, `Tiptap`.
  - [`views/DashboardView/components/tagComponents/NoteTagsRow.tsx`](views/DashboardView/components/tagComponents/NoteTagsRow.tsx) — pill row.

### Step 2 — Add tag UX

- **What**: shadcn `Popover` tag picker (`TagPickerPopover`): focused input, autocomplete from global tags, “Create …” when no exact match, Enter to attach. Same picker from **“+ Add tag”** and toolbar **`#`** (only when a note is loaded).
- **API**: `POST /api/tags` via [`lib/tagsApi.ts`](lib/tagsApi.ts) `createTagRequest({ name, noteId })`.
- **Autocomplete source**: react-query cache `['foldersAndNotes']` from `GET /api/folders` (`GetAllItems` includes `Tags`).
- **Main files**:
  - [`views/DashboardView/components/tagComponents/TagPickerPopover.tsx`](views/DashboardView/components/tagComponents/TagPickerPopover.tsx)
  - [`components/tiptap/TipTap.tsx`](components/tiptap/TipTap.tsx) — passes `note` into `ToolBar`.
  - [`components/tiptap/ToolBar.tsx`](components/tiptap/ToolBar.tsx) — `#` trigger + `TagPickerPopover`.

### Step 3 — Remove tag

- **What**: Each pill shows an **x** on hover (and focus-visible for keyboard); click removes tag from the note.
- **API**: `DELETE /api/tags` with JSON `{ name, noteId }` via [`lib/tagsApi.ts`](lib/tagsApi.ts) `deleteTagRequest`.
- **Backend behavior** (for cache invalidation): if the tag is still used elsewhere it stays in DB; otherwise the tag row may be deleted globally.
- **Cache**: Optimistic removal from `['note', noteSlug]`; on settle invalidate `['note', noteSlug]` and `['foldersAndNotes']`.
- **Main file**: [`views/DashboardView/components/tagComponents/NoteTagsRow.tsx`](views/DashboardView/components/tagComponents/NoteTagsRow.tsx).

---

## Types and API routes (reference)

- Global types: [`types/types.d.ts`](types/types.d.ts) — `Note.tags`, `Tag`, `FoldersWithTags`, etc.
- Next.js proxies:
  - [`app/api/tags/route.ts`](app/api/tags/route.ts) — `POST` create/attach, `DELETE` remove by `name` + `noteId`.
  - [`app/api/folders/route.ts`](app/api/folders/route.ts) — `GET` returns GetAllItems (folders + tags).
  - [`app/api/notes/search/route.ts`](app/api/notes/search/route.ts) — search; tags query param was planned for filtering.

---

## Remaining work (for follow-up steps)

Do these **one step at a time** unless the team agrees to batch.

### Step 4 — Sidebar tag filter

- **Goal**: Below Explorer, list user tags (e.g. `-backend`, `-auth`). Clicking a tag **filters which notes appear** in the tree/list; **highlight the active** tag.
- **Likely approach**:
  - Read tags from `['foldersAndNotes']` (same as picker) or ensure shape matches `FoldersWithTags`.
  - Add URL or client state (e.g. `?tag=` or dashboard context) and filter `NoteList` / folder rendering without full page reload.
- **Files to touch first**: [`views/DashboardView/components/ExplorerSection.tsx`](views/DashboardView/components/ExplorerSection.tsx), [`views/DashboardView/components/folderComponents/FoldersComponent.tsx`](views/DashboardView/components/folderComponents/FoldersComponent.tsx), [`views/DashboardView/components/noteComponent/NoteList.tsx`](views/DashboardView/components/noteComponent/NoteList.tsx).

### Step 5 — Search integration

- **Goal**: Show tags on search results; support combined query + tag filter, e.g. `search?q=jwt&tag=backend` (or array param per backend).
- **Note**: Search API may not return tags yet; placeholder tags in UI were acceptable until backend catches up.
- **Files**: [`app/api/notes/search/route.ts`](app/api/notes/search/route.ts), any search results view/components (search for `SearchNotesResponse` / notes search usage).

---

## React-query keys to remember

| Key | Purpose |
|-----|---------|
| `['note', slug]` | Single note (includes `tags`). |
| `['foldersAndNotes']` | Folders tree + global `Tags` list from GetAllItems. |

---

## Conventions

- **Display**: `#tagname` in UI; **API** uses plain `name` strings.
- **Matching**: Several helpers use case-insensitive name comparison for attach/remove.

---

*Last updated for agent handoff; extend this file when Step 4+ land.*
