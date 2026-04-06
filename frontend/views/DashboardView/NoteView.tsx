"use client";
import Tiptap from "@/components/tiptap/TipTap";
import { useQuery } from "@tanstack/react-query";
import { useFetchWrapperClient } from "@/lib/fetchWrapperClient";
import NoteTappedNavigation from "./components/noteComponent/NoteTappedNavigation";

export default function NoteView({ slug }: { slug: string }) {
  const fetchClient = useFetchWrapperClient();

  const { data, isPending, error, isError } = useQuery({
    queryKey: ["note", slug],
    queryFn: async ({ queryKey, signal }) => {
      const [_key, slug] = queryKey;
      return fetchClient(`http://localhost:5001/api/notes/GetBySlug/${slug}`, {
        signal,
      });
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

  return (
    <div className="flex flex-col min-h-0 overflow-hidden">
      <NoteTappedNavigation note={data.data} />
      <Tiptap note={data?.data} />
    </div>
  );
}
