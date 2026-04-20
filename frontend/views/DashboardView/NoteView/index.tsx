"use client";
import Tiptap from "@/components/tiptap/TipTap";
import { useQuery } from "@tanstack/react-query";
import NoteTappedNavigation from "../components/explorerPanel/noteComponent/NoteTappedNavigation";
import { fetchWithAuth } from "@/lib/fetchWithAuthentication";
import { NoteTagsRow } from "../components/tagComponents/NoteTagsRow";

export default function NoteView({ slug }: { slug: string }) {
  const { data, isPending, error, isError } = useQuery({
    queryKey: ["note", slug],
    queryFn: async ({ queryKey, signal }) => {
      const [_key, slug] = queryKey;
      const res = await fetchWithAuth(`/api/notes/getBySlug/${slug}`, {
        signal,
      });
      return res.json();
    },
  });

  if (isPending)
    return (
      <div>
        <NoteTappedNavigation /> Loading Editor...
      </div>
    );

  if (isError) {
    console.error(error);
    return <div>Failed to load note data</div>;
  }

  console.log(data);
  return (
    <div className="flex flex-col min-h-0 min-w-0 flex-1">
      <NoteTappedNavigation note={data.data} />
      <NoteTagsRow
        noteId={data.data.id}
        noteSlug={slug}
        tags={data?.data?.tags}
      />
      <Tiptap note={data?.data} />
    </div>
  );
}
