import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Editor } from "@tiptap/react";
// import { requireAuth } from "./dal";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIso(iso: string): string {
  const date = new Date(iso);

  const result = date.toLocaleString("en-US", {
    month: "short", // "Mar"
    day: "numeric", // "28"
    hour: "numeric", // "8"
    minute: "2-digit", // "11"
    hour12: true, // "PM"
  });

  return result;
}

export async function uploadImage(
  file: File,
  editor: Editor,
  noteId?: string,
  pos?: number,
) {
  // const { accessToken } = await requireAuth();

  if (!noteId) {
    throw new Error("no note id is given");
  }
  //show ghost image
  const tempUrl = URL.createObjectURL(file);
  if (pos !== undefined) {
    editor
      .chain()
      .insertContentAt(pos, {
        type: "image",
        attrs: { src: tempUrl, alt: file.name },
      })
      .focus()
      .run();
  } else {
    editor.chain().focus().setImage({ src: tempUrl }).run();
  }
  //send to backend
  const formData = new FormData();
  formData.append("file", file);
  try {
    const reponse = await fetch(
      `http://localhost:5001/api/notes/${noteId}/upload-image`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      },
    );

    const data = await reponse.json();

    //swap ghost for real
    const { state, view } = editor;

    state.doc.descendants((node, nodePos) => {
      if (node.type.name === "image" && node.attrs.src === tempUrl) {
        const transaction = state.tr.setNodeMarkup(nodePos, null, {
          ...node.attrs,
          src: data.data.url + `?access_token=${accessToken}`,
        });
        view.dispatch(transaction);
      }
    });
  } catch (error) {
    console.error("Upload failed", error);
  } finally {
    URL.revokeObjectURL(tempUrl);
  }
}

export function toMaxAge(dateString: string) {
  return Math.max(
    0,
    Math.floor((new Date(dateString).getTime() - Date.now()) / 1000),
  );
}
