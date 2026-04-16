"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ToolBar from "./ToolBar";
import Underline from "@tiptap/extension-underline";
import CodeBlockLowLight from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";
import ImageResize from "tiptap-extension-resize-image";
import FileHandler from "@tiptap/extension-file-handler";
import { uploadImage } from "@/lib/attachmentApi";
import { useEffect } from "react";
import { Editor } from "@tiptap/react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import { TaskList } from "@tiptap/extension-list";
import { TaskItem } from "@tiptap/extension-list";
import { updateNoteBodyRequest } from "@/lib/noteApi";
import DragHandle from "@tiptap/extension-drag-handle-react";
import { GripVertical } from "lucide-react";
import HighLight from "@tiptap/extension-highlight";

const lowlight = createLowlight(all);

const Tiptap = ({ note }: { note?: Note }) => {
  const queryClient = useQueryClient();
  const mutationToUpdateNote = useMutation({
    mutationFn: (noteToUpdate: {
      body: string;
      id?: string;
      imageIds: string[];
    }) => {
      return updateNoteBodyRequest(
        noteToUpdate.body,
        noteToUpdate.id,
        noteToUpdate.imageIds,
      );
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
      ImageResize.configure({
        minWidth: 50,
      }),
      HighLight.configure({ multicolor: true }),
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
      const imageIds: string[] = [];
      editor?.state.doc.descendants((node) => {
        if (node.type.name === "image") {
          imageIds.push(node.attrs.src.split("/").filter(Boolean)[2]);
        }
      });
      console.log(imageIds);
      mutationToUpdateNote.mutate({
        body: JSON.stringify(json),
        id: note?.id,
        imageIds: imageIds,
      });
    },
    2000,
    { maxWait: 5000 },
  );

  useEffect(() => {
    return () => debounced.flush();
  }, [debounced]);

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 flex flex-col">
        <ToolBar editor={editor} note={note} />
        <div className="flex-1 overflow-y-auto min-h-0 max-h-200">
          {editor && (
            <DragHandle
              editor={editor}
              nested={{ edgeDetection: { threshold: -16 } }}
              computePositionConfig={{
                placement: "left",
                strategy: "fixed",
              }}
            >
              <GripVertical className="size-5 cursor-grab text-center p-0.5 mr-5" />
            </DragHandle>
          )}
          <EditorContent
            editor={editor}
            className="flex flex-col min-h-0 dark:text-neutral-50 text-foreground text-lg leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};

export default Tiptap;
