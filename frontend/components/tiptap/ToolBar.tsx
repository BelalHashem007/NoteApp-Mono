"use client";
import { Editor, useEditorState } from "@tiptap/react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toolBarStateSelector } from "@/lib/toolBarState";
import {
  ChevronDown,
  List,
  ListOrdered,
  Redo,
  Undo,
  Bold,
  Italic,
  Strikethrough,
  TextQuote,
  Code,
  Minus,
  Underline,
  ListTodo,
} from "lucide-react";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type DropDownState =
  | "Paragraph"
  | "Heading 1"
  | "Heading 2"
  | "Heading 3"
  | "Heading 4"
  | "Heading 5"
  | "Heading 6";

export default function ToolBar({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState<boolean>(false);
  const editorState = useEditorState({
    editor,
    selector: toolBarStateSelector,
  });

  if (editor === null) return;

  const getLabel = (): DropDownState => {
    if (!editorState) return "Paragraph";
    if (editorState?.isHeading1) return "Heading 1";
    if (editorState?.isHeading2) return "Heading 2";
    if (editorState?.isHeading3) return "Heading 3";
    if (editorState?.isHeading4) return "Heading 4";
    if (editorState?.isHeading5) return "Heading 5";
    if (editorState?.isHeading6) return "Heading 6";
    return "Paragraph";
  };

  const handleHeadingChange = (label: DropDownState, level?: HeadingLevel) => {
    setTimeout(() => {
      if (level) {
        editor.chain().focus().toggleHeading({ level }).run();
      } else {
        editor.chain().focus().setParagraph().run();
      }
    }, 0);
  };
  return (
    <div className="bg-primary/10 border-b p-3 flex items-center gap-5">
      {/* History */}
      <div className="flex gap-2">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editorState?.canUndo}
          className="disabled:text-gray-400 disabled:hover:cursor-not-allowed disabled:cursor-not-allowed *:pointer-events-none rounded-full p-2 enabled:hover:bg-primary/10"
          title="Undo "
        >
          <Undo className="size-5" />
        </button>
        <button
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editorState?.canRedo}
          className="disabled:text-gray-400 disabled:hover:cursor-not-allowed disabled:cursor-not-allowed *:pointer-events-none rounded-full p-2 enabled:hover:bg-primary/10"
        >
          <Redo className="size-5" />
        </button>
      </div>

      {/*Seperator*/}
      <div className="h-full w-px bg-gray-400"></div>

      {/*Headers List*/}
      <div>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger
            className="border p-2 bg-neutral-100 shadow w-32"
            asChild
          >
            <button className="rounded-md text-left relative">
              <span className="">{getLabel()}</span>{" "}
              <ChevronDown className="size-4 shrink-0 absolute right-2 top-1/2 -translate-y-1/2" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-40 "
            align="start"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuGroup>
              <DropdownMenuItem
                className={`${editorState?.isParagraph && "bg-accent/40"} `}
                onSelect={(e) => {
                  e.preventDefault();
                  handleHeadingChange("Paragraph");
                  setOpen(false);
                }}
              >
                Paragraph
                {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`${editorState?.isHeading1 && "bg-accent/40"} `}
                onSelect={(e) => {
                  e.preventDefault();
                  handleHeadingChange("Heading 1", 1);
                  setOpen(false);
                }}
              >
                Heading 1
                {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`${editorState?.isHeading2 && "bg-accent/40"} `}
                onSelect={(e) => {
                  e.preventDefault();
                  handleHeadingChange("Heading 2", 2);
                  setOpen(false);
                }}
              >
                Heading 2{/* <DropdownMenuShortcut>⌘B</DropdownMenuShortcut> */}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`${editorState?.isHeading3 && "bg-accent/40"} `}
                onSelect={(e) => {
                  e.preventDefault();
                  handleHeadingChange("Heading 3", 3);
                  setOpen(false);
                }}
              >
                Heading 3{/* <DropdownMenuShortcut>⌘S</DropdownMenuShortcut> */}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`${editorState?.isHeading4 && "bg-accent/40"} `}
                onSelect={(e) => {
                  e.preventDefault();
                  handleHeadingChange("Heading 4", 4);
                  setOpen(false);
                }}
              >
                Heading 4
                {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`${editorState?.isHeading5 && "bg-accent/40"} `}
                onSelect={(e) => {
                  e.preventDefault();
                  handleHeadingChange("Heading 5", 5);
                  setOpen(false);
                }}
              >
                Heading 5{/* <DropdownMenuShortcut>⌘B</DropdownMenuShortcut> */}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`${editorState?.isHeading6 && "bg-accent/40"} `}
                onSelect={(e) => {
                  e.preventDefault();
                  handleHeadingChange("Heading 6", 6);
                  setOpen(false);
                }}
              >
                Heading 6{/* <DropdownMenuShortcut>⌘S</DropdownMenuShortcut> */}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/*Seperator*/}
      <div className="h-full w-px bg-gray-400"></div>

      {/*Lists*/}
      <div className="flex gap-3">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${editorState?.isBulletList ? "bg-primary/50 shadow text-white" : "hover:bg-primary/10"} rounded-full p-2`}
          title="Bullet List"
          type="button"
        >
          <List className="pointer-events-none" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${editorState?.isOrderedList ? "bg-primary/50 shadow text-white" : "hover:bg-primary/10"} rounded-full p-2`}
          title="Ordered List"
          type="button"
        >
          <ListOrdered className="pointer-events-none" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`${editorState?.isTaskList ? "bg-primary/50 shadow text-white" : "hover:bg-primary/10"} rounded-full p-2`}
          title="Task List"
          type="button"
        >
          <ListTodo className="pointer-events-none" />
        </button>
      </div>

      {/*Seperator*/}
      <div className="h-full w-px bg-gray-400"></div>

      {/* Text Formatting */}
      <div className="flex gap-3">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${editorState?.isBold ? "bg-primary/50 shadow text-white" : "hover:bg-primary/10"} rounded-full p-2`}
          title="Bold"
        >
          <Bold />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${editorState?.isItalic ? "bg-primary/50 shadow text-white" : "hover:bg-primary/10"} rounded-full p-2`}
          title="Italic"
        >
          <Italic />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${editorState?.isUnderline ? "bg-primary/50 shadow text-white" : "hover:bg-primary/10"} rounded-full p-2`}
          title="Underline"
        >
          <Underline />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`${editorState?.isStrike ? "bg-primary/50 shadow text-white" : "hover:bg-primary/10"} rounded-full p-2`}
          title="Strikethrough"
        >
          <Strikethrough />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${editorState?.isBlockquote ? "bg-primary/50 shadow text-white" : "hover:bg-primary/10"}  rounded-full p-2`}
          title="Blockquote"
        >
          <TextQuote />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`${editorState?.isCodeBlock ? "bg-primary/50 shadow text-white" : "hover:bg-primary/10"}  rounded-full p-2`}
          title="Code Block"
        >
          <Code />
        </button>
      </div>

      {/*Seperator*/}
      <div className="h-full w-px bg-gray-400"></div>

      {/* HorizontalLine */}
      <div>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={`hover:bg-primary/10 rounded-full p-2`}
          title="Horizontal Line"
        >
          <Minus />
        </button>
      </div>

      {/* Save Button
      <div>
        <button
          className=" rounded-full p-2 hover:bg-gray-300"
          title="Save Note"
          onClick={() =>
            mutation.mutate({
              body: JSON.stringify(editor.getJSON()),
              id: note?.id,
            })
          }
        >
          <Save />
        </button>
      </div> */}
    </div>
  );
}
