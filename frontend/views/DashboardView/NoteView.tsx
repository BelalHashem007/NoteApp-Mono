"use client";
import Tiptap from "@/components/tiptap/TipTap";
import { useQuery } from "@tanstack/react-query";
import { useFetchWrapperClient } from "@/helper/fetchWrapperClient";

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

  if (isPending) return <div>Loading Editor...</div>;

  if (isError) console.error(error);

  return <Tiptap note={data?.data} />;
}
