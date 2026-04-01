"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ToolBar from "./ToolBar";
import Underline from "@tiptap/extension-underline";
import CodeBlockLowLight from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";
import Image from "@tiptap/extension-image";
import FileHandler from "@tiptap/extension-file-handler";
import { uploadImage } from "@/helper/uploadImage";
import { useSession } from "next-auth/react";
import { useRef, useEffect } from "react";
import { Editor } from "@tiptap/react";

const lowlight = createLowlight(all);

const Tiptap = () => {
  const { data: session, status } = useSession();
  const sessionRef = useRef(session);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const handleUploadImage = (file: File, editor: Editor, pos?: number) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const currentSession = sessionRef.current;

    if (!currentSession?.accessToken) {
      console.warn("No session available for upload");
      return;
    }

    uploadImage(file, editor, currentSession, pos);
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        underline: false,
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
    content: "<p>Hello World! 🌎️</p>",
    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
  });

  if (status === "loading" || !session) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="flex flex-col grow editorWrapper m-5">
      <ToolBar editor={editor} />
      <EditorContent editor={editor} className="flex grow pt-5 px-5" />
    </div>
  );
};

export default Tiptap;
