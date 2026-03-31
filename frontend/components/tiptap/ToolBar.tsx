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
import { toolBarStateSelector } from "@/helper/toolBarState";
import { ChevronDown, List, ListOrdered } from "lucide-react";

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
    <div className="bg-[rgb(248,250,252)] border-b p-3 flex items-center gap-5">
      {/*Headers List*/}
      <div>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger className="border p-2 bg-white shadow" asChild>
            <button className="flex gap-2">
              {getLabel()} <ChevronDown />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-40"
            align="start"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuGroup>
              <DropdownMenuItem
                className={`${editorState?.isParagraph && "dropDownActive"} `}
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
                className={`${editorState?.isHeading1 && "dropDownActive"} `}
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
                className={`${editorState?.isHeading2 && "dropDownActive"} `}
                onSelect={(e) => {
                  e.preventDefault();
                  handleHeadingChange("Heading 2", 2);
                  setOpen(false);
                }}
              >
                Heading 2{/* <DropdownMenuShortcut>⌘B</DropdownMenuShortcut> */}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`${editorState?.isHeading3 && "dropDownActive"} `}
                onSelect={(e) => {
                  e.preventDefault();
                  handleHeadingChange("Heading 3", 3);
                  setOpen(false);
                }}
              >
                Heading 3{/* <DropdownMenuShortcut>⌘S</DropdownMenuShortcut> */}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`${editorState?.isHeading4 && "dropDownActive"} `}
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
                className={`${editorState?.isHeading5 && "dropDownActive"} `}
                onSelect={(e) => {
                  e.preventDefault();
                  handleHeadingChange("Heading 5", 5);
                  setOpen(false);
                }}
              >
                Heading 5{/* <DropdownMenuShortcut>⌘B</DropdownMenuShortcut> */}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`${editorState?.isHeading6 && "dropDownActive"} `}
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
      <div className="h-full w-0.5 bg-gray-300"></div>
      {/*Lists*/}
      <div className="flex gap-3">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${editorState?.isBulletList && "bg-gray-500 shadow text-white"} p-1`}
          title="Bullet List"
        >
          <List />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${editorState?.isOrderedList && "bg-gray-500 shadow text-white"} p-1`}
          title="Ordered List"
        >
          <ListOrdered />
        </button>
      </div>
    </div>
  );
}
