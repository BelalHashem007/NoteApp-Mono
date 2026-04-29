"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import CodeBlockLowLight from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";
import ImageResize from "tiptap-extension-resize-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import DragHandle from "@tiptap/extension-drag-handle-react";
import { GripVertical } from "lucide-react";
import HighLight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import { useRef } from "react";

import ToolBar from "./ToolBar";
import { LinkHoverElement } from "@/views/DashboardView/NoteView/components/LinkHoverElement";

const lowlight = createLowlight(all);

const demoContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [
        { type: "text", text: "Build structured notes without leaving flow" },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "NoteFlow combines a " },
        {
          type: "text",
          marks: [{ type: "bold" }],
          text: "developer-first workspace",
        },
        {
          type: "text",
          text: " with rich formatting, searchable content, and folder-based organization.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Try adding links like " },
        {
          type: "text",
          marks: [
            {
              type: "link",
              attrs: {
                href: "https://tiptap.dev",
                target: "_blank",
                rel: "noopener noreferrer nofollow",
                class: null,
              },
            },
          ],
          text: "TipTap documentation",
        },
        { type: "text", text: ", highlights, images, and code snippets." },
      ],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Rich text formatting and nested lists" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Resizable images for visual notes" },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "taskList",
      content: [
        {
          type: "taskItem",
          attrs: { checked: true },
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Draft technical ideas" }],
            },
          ],
        },
        {
          type: "taskItem",
          attrs: { checked: false },
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Organize notes into folders and tags" },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "codeBlock",
      attrs: { language: "tsx" },
      content: [
        {
          type: "text",
          text: "const note = editor.getJSON();\nawait saveNote(note);",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          marks: [{ type: "highlight", attrs: { color: "#fef08a" } }],
          text: "Highlight important context before it gets lost.",
        },
      ],
    },
    { type: "horizontalRule" },
    {
      type: "imageResize",
      attrs: {
        src: "https://images.unsplash.com/photo-1628258334105-2a0b3d6efee1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        alt: "Laptop with code editor on a desk",
      },
    },
  ],
};

export default function TipTapDemo() {
  const isMarkerListItemRef = useRef(false);

  const editor = useEditor({
    content: demoContent,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        underline: false,
        link: false,
      }),
      Link.configure({
        openOnClick: false,
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
    ],
    immediatelyRender: false,
  });

  return (
    <div className="flex min-h-144 min-w-0 overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-2xl dark:bg-card">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <ToolBar editor={editor} hiddenToolIds={["tags"]} />
        <div className="relative min-h-0 max-h-144 flex-1 overflow-auto bg-background/80 min-[480px]:px-6 min-[480px]:py-5 py-2 pr-2 pl-6 dark:bg-card">
          {editor && (
            <>
              <DragHandle
                editor={editor}
                nested={{ edgeDetection: { threshold: -16 } }}
                onNodeChange={({ node }) => {
                  isMarkerListItemRef.current = node?.type.name === "listItem";
                }}
                computePositionConfig={{
                  placement: "left",
                  strategy: "fixed",
                  middleware: [
                    {
                      name: "markerListItemOffset",
                      fn({ x, y }) {
                        if (isMarkerListItemRef.current) {
                          return { x: x - 16, y };
                        }
                        return { x, y };
                      },
                    },
                  ],
                }}
              >
                <GripVertical className="mr-0 min-[480]:mr-2 min-[768px]:mr-4 size-5 cursor-grab p-0.5 text-center text-muted-foreground" />
              </DragHandle>

              <LinkHoverElement editor={editor} />
            </>
          )}
          <EditorContent
            editor={editor}
            className="demoEditor mx-auto flex min-h-full max-w-3xl flex-col text-base leading-relaxed text-foreground [&_.ProseMirror]:min-h-120 [&_.ProseMirror]:outline-none [&_.ProseMirror_img]:rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}
