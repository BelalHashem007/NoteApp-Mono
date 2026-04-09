"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ToolBar from "./ToolBar";
import Underline from "@tiptap/extension-underline";
import CodeBlockLowLight from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";
import Image from "@tiptap/extension-image";
import FileHandler from "@tiptap/extension-file-handler";
import { uploadImage } from "@/lib/utils";
import { useEffect } from "react";
import { Editor } from "@tiptap/react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { updateNoteBody } from "@/actions/actions";
import { useDebouncedCallback } from "use-debounce";
import { TaskList } from "@tiptap/extension-list";
import { TaskItem } from "@tiptap/extension-list";

const lowlight = createLowlight(all);

const Tiptap = ({ note }: { note?: Note }) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (noteToUpdate: { body: string; id?: string }) => {
      return updateNoteBody(noteToUpdate.body, noteToUpdate.id);
    },
    onMutate: async (noteToUpdate, context) => {
      await context.client.cancelQueries({ queryKey: ["note", note?.slug] });

      const previousNote = context.client.getQueryData(["note", note?.slug]);

      context.client.setQueryData(
        ["note", note?.slug],
        (old: ApiResponse<Note>) => {
          return { ...old, data: { ...old.data, body: noteToUpdate.body } };
        },
      );

      return { previousNote };
    },
    onError: (err, noteToUpdate, onMutateResult, context) => {
      context.client.setQueryData(
        ["note", note?.slug],
        onMutateResult?.previousNote,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["note", note?.slug] });
    },
  });

  const handleUploadImage = (file: File, editor: Editor, pos?: number) => {
    uploadImage(file, editor, note?.id, pos);
  };

  const editor = useEditor({
    content: JSON.parse(note?.body ?? "{}"),
    onUpdate: ({ editor }) => {
      console.log("Editor is updating....");
      debounced(editor.getJSON());
    },
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        underline: false,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Underline,
      CodeBlockLowLight.configure({
        lowlight,
      }),
      Image.configure({
        resize: {
          enabled: true,
          directions: ["top", "bottom", "left", "right"],
          minWidth: 50,
          minHeight: 50,
          alwaysPreserveAspectRatio: true,
        },
      }),
      FileHandler.configure({
        allowedMimeTypes: [
          "image/png",
          "image/jpeg",
          "image/gif",
          "image/webp",
        ],
        onDrop: (currentEditor, files, pos) => {
          files.forEach((file) => {
            handleUploadImage(file, currentEditor, pos);
          });
        },
        onPaste: (currentEditor, files) => {
          files.forEach((file) => {
            handleUploadImage(file, currentEditor);
          });
        },
      }),
    ],
    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
  });

  const debounced = useDebouncedCallback(
    (json) => {
      console.log("iam saving....");
      mutation.mutate({
        body: JSON.stringify(json),
        id: note?.id,
      });
    },
    2000,
    { maxWait: 5000 },
  );

  useEffect(() => {
    return () => debounced.flush();
  }, [debounced]);

  return (
    <div className="flex flex-col flex-1 bg-background overflow-hidden">
      <ToolBar editor={editor} />
      <div className="flex-1 overflow-y-auto min-h-0">
        <EditorContent
          editor={editor}
          className="flex flex-col min-h-0 w-full text-foreground text-lg leading-relaxed 2xl:max-w-300 md:max-w-150 max-w-50"
        />
      </div>
    </div>
  );
};

export default Tiptap;
