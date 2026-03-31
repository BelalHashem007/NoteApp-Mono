"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ToolBar from "./ToolBar";

const Tiptap = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Hello World! 🌎️</p>",
    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
  });

  return (
    <div className="flex flex-col grow editorWrapper m-5">
      <ToolBar editor={editor} />
      <EditorContent editor={editor} className="flex grow pt-5 px-3" />
    </div>
  );
};

export default Tiptap;
