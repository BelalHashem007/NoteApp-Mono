"use client";

import { Editor } from "@tiptap/react";
import { useState, useRef, useEffect, useId } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TagPickerPopover } from "@/views/DashboardView/components/tagComponents/TagPickerPopover";
import { Separator } from "../ui/separator";
import { ToolBarState } from "@/lib/toolBarState";
import {
  ChevronDown,
  List,
  ListOrdered,
  Bold,
  Italic,
  Strikethrough,
  TextQuote,
  Code,
  Minus,
  Underline,
  ListTodo,
  Highlighter,
  Redo,
  Undo,
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

export type ToolCtx = {
  editor: Editor;
  editorState: ToolBarState;
  note?: Note;
};

export type ToolItem =
  | {
      kind: "tool";
      id: string;
      /**
       * Px width threshold. The tool is hidden in the main toolbar when
       * viewport width is at or below this value, and shown in the overflow
       * menu instead. Use 0 if it should always be visible in the toolbar.
       */
      hiddenAtOrBelow: number;
      render: (ctx: ToolCtx) => React.ReactNode;
    }
  | {
      kind: "separator";
      id: string;
      hiddenAtOrBelow: number;
    };

/**
 * Tailwind needs class strings to appear literally in source so the JIT can
 * detect them. Keep these maps in sync with the breakpoints used in TOOLS.
 */
export const HIDE_AT_OR_BELOW: Record<number, string> = {
  0: "",
  360: "max-[360px]:hidden",
  580: "max-[550px]:hidden",
  1120: "max-[1120px]:hidden",
  1350: "max-[1350px]:hidden",
  1450: "max-[1450px]:hidden",
  1550: "max-[1550px]:hidden",
};

/** Inverse of HIDE_AT_OR_BELOW: visible only when viewport is at/below the bp. */
export const SHOWN_AT_OR_BELOW: Record<number, string> = {
  0: "hidden",
  360: "min-[361px]:hidden",
  580: "min-[551px]:hidden",
  1120: "min-[1121px]:hidden",
  1350: "min-[1351px]:hidden",
  1450: "min-[1451px]:hidden",
  1550: "min-[1551px]:hidden",
};

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

function ToggleButton({
  active,
  onClick,
  title,
  children,
  extraClassName = "",
  disabled = false,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  extraClassName?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${
        active
          ? "bg-primary/50 dark:bg-neutral-700 shadow text-white"
          : "hover:bg-primary/10 dark:hover:bg-neutral-800"
      } rounded-full p-2 transition-all ${extraClassName}`}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Tool components
// ---------------------------------------------------------------------------

function UndoButton({ editor, editorState }: ToolCtx) {
  return (
    <button
      type="button"
      onClick={() => editor.chain().focus().undo().run()}
      disabled={!editorState?.canUndo}
      className="disabled:text-gray-400 disabled:hover:cursor-not-allowed disabled:cursor-not-allowed *:pointer-events-none rounded-full p-2 enabled:hover:bg-primary/10 transition-all"
      title="Undo"
    >
      <Undo className="size-5" />
    </button>
  );
}

function RedoButton({ editor, editorState }: ToolCtx) {
  return (
    <button
      type="button"
      title="Redo"
      onClick={() => editor.chain().focus().redo().run()}
      disabled={!editorState?.canRedo}
      className="disabled:text-gray-400 disabled:hover:cursor-not-allowed disabled:cursor-not-allowed *:pointer-events-none rounded-full p-2 enabled:hover:bg-primary/10 transition-all"
    >
      <Redo className="size-5" />
    </button>
  );
}

function HeadingsSelect({ editor, editorState }: ToolCtx) {
  const [open, setOpen] = useState(false);

  const getLabel = (): DropDownState => {
    if (!editorState) return "Paragraph";
    if (editorState.isHeading1) return "Heading 1";
    if (editorState.isHeading2) return "Heading 2";
    if (editorState.isHeading3) return "Heading 3";
    if (editorState.isHeading4) return "Heading 4";
    if (editorState.isHeading5) return "Heading 5";
    if (editorState.isHeading6) return "Heading 6";
    return "Paragraph";
  };

  const apply = (level?: HeadingLevel) => {
    setTimeout(() => {
      if (level) {
        editor.chain().focus().toggleHeading({ level }).run();
      } else {
        editor.chain().focus().setParagraph().run();
      }
    }, 0);
  };

  const items: {
    label: DropDownState;
    level?: HeadingLevel;
    active: boolean;
  }[] = [
    { label: "Paragraph", active: !!editorState?.isParagraph },
    { label: "Heading 1", level: 1, active: !!editorState?.isHeading1 },
    { label: "Heading 2", level: 2, active: !!editorState?.isHeading2 },
    { label: "Heading 3", level: 3, active: !!editorState?.isHeading3 },
    { label: "Heading 4", level: 4, active: !!editorState?.isHeading4 },
    { label: "Heading 5", level: 5, active: !!editorState?.isHeading5 },
    { label: "Heading 6", level: 6, active: !!editorState?.isHeading6 },
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className="border dark:border-neutral-700 p-2 shadow-accent w-32"
        asChild
      >
        <button type="button" className="rounded-md text-left relative">
          <span>{getLabel()}</span>
          <ChevronDown className="size-4 shrink-0 absolute right-2 top-1/2 -translate-y-1/2" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-40"
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuGroup>
          {items.map((it) => (
            <DropdownMenuItem
              key={it.label}
              className={it.active ? "bg-accent/40 dark:bg-neutral-700/30" : ""}
              onSelect={(e) => {
                e.preventDefault();
                apply(it.level);
                setOpen(false);
              }}
            >
              {it.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BulletListButton({ editor, editorState }: ToolCtx) {
  return (
    <ToggleButton
      active={!!editorState?.isBulletList}
      onClick={() => editor.chain().focus().toggleBulletList().run()}
      title="Bullet List"
    >
      <List className="pointer-events-none" />
    </ToggleButton>
  );
}

function OrderedListButton({ editor, editorState }: ToolCtx) {
  return (
    <ToggleButton
      active={!!editorState?.isOrderedList}
      onClick={() => editor.chain().focus().toggleOrderedList().run()}
      title="Ordered List"
    >
      <ListOrdered className="pointer-events-none" />
    </ToggleButton>
  );
}

function TaskListButton({ editor, editorState }: ToolCtx) {
  return (
    <ToggleButton
      active={!!editorState?.isTaskList}
      onClick={() => editor.chain().focus().toggleTaskList().run()}
      title="Task List"
    >
      <ListTodo className="pointer-events-none" />
    </ToggleButton>
  );
}

function BoldButton({ editor, editorState }: ToolCtx) {
  return (
    <ToggleButton
      active={!!editorState?.isBold}
      onClick={() => editor.chain().focus().toggleBold().run()}
      title="Bold"
    >
      <Bold />
    </ToggleButton>
  );
}

function ItalicButton({ editor, editorState }: ToolCtx) {
  return (
    <ToggleButton
      active={!!editorState?.isItalic}
      onClick={() => editor.chain().focus().toggleItalic().run()}
      title="Italic"
    >
      <Italic />
    </ToggleButton>
  );
}

function UnderlineButton({ editor, editorState }: ToolCtx) {
  return (
    <ToggleButton
      active={!!editorState?.isUnderline}
      onClick={() => editor.chain().focus().toggleUnderline().run()}
      title="Underline"
    >
      <Underline />
    </ToggleButton>
  );
}

function StrikeButton({ editor, editorState }: ToolCtx) {
  return (
    <ToggleButton
      active={!!editorState?.isStrike}
      onClick={() => editor.chain().focus().toggleStrike().run()}
      title="Strikethrough"
    >
      <Strikethrough />
    </ToggleButton>
  );
}

function BlockquoteButton({ editor, editorState }: ToolCtx) {
  return (
    <ToggleButton
      active={!!editorState?.isBlockquote}
      onClick={() => editor.chain().focus().toggleBlockquote().run()}
      title="Blockquote"
    >
      <TextQuote />
    </ToggleButton>
  );
}

function CodeBlockButton({ editor, editorState }: ToolCtx) {
  return (
    <ToggleButton
      active={!!editorState?.isCodeBlock}
      onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      title="Code Block"
    >
      <Code />
    </ToggleButton>
  );
}

function HorizontalRuleButton({ editor }: ToolCtx) {
  return (
    <ToggleButton
      active={false}
      onClick={() => editor.chain().focus().setHorizontalRule().run()}
      title="Horizontal Line"
    >
      <Minus />
    </ToggleButton>
  );
}

function HighlighterControl({ editor, editorState }: ToolCtx) {
  const [color, setColor] = useState("yellow");
  const colorInputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();

  useEffect(() => {
    const update = () => {
      const attrs = editor.getAttributes("highlight");
      if (attrs?.color && colorInputRef.current) {
        colorInputRef.current.value = attrs.color;
        setColor(attrs.color);
      }
    };
    editor.on("selectionUpdate", update);
    return () => {
      editor.off("selectionUpdate", update);
    };
  }, [editor]);

  return (
    <div className="relative flex items-center gap-2">
      <label
        htmlFor={inputId}
        className="flex items-center justify-center border dark:border-neutral-700 rounded-full p-2 cursor-pointer hover:bg-primary/10 dark:hover:bg-neutral-800 transition-all"
      >
        <Highlighter style={{ fill: color }} />
      </label>
      <input
        id={inputId}
        type="color"
        ref={colorInputRef}
        defaultValue={color}
        className="absolute inset-0 w-0 h-0 opacity-0"
        autoFocus={false}
        onBlur={() => {
          const c = colorInputRef.current?.value;
          if (c) setColor(c);
        }}
      />
      <button
        type="button"
        onClick={() => {
          const c = colorInputRef.current?.value || "#eab308";
          setColor(c);
          editor.chain().focus().toggleHighlight({ color: c }).run();
        }}
        className={`${
          editorState?.isHighlight
            ? "bg-primary/50 dark:bg-neutral-800 dark:text-white shadow text-white"
            : ""
        } hover:bg-primary/10 dark:hover:bg-neutral-800 transition-colors p-2 rounded-full flex gap-1 dark:text-[#a1a1a1] text-black`}
      >
        Toggle
      </button>
    </div>
  );
}

function TagsButton({ note }: ToolCtx) {
  if (!note?.id || !note?.slug) return null;
  return (
    <TagPickerPopover
      noteId={note.id}
      noteSlug={note.slug}
      currentTags={note.tags}
    >
      <button
        type="button"
        className="hover:bg-primary/10 rounded-full px-3 py-2 text-sm font-semibold transition-all"
        title="Tags"
      >
        #
      </button>
    </TagPickerPopover>
  );
}

// ---------------------------------------------------------------------------
// Tool registry — single source of truth for both the toolbar and the
// overflow menu. To add a tool: drop a new entry here.
// ---------------------------------------------------------------------------

export const TOOLS: ToolItem[] = [
  {
    kind: "tool",
    id: "undo",
    hiddenAtOrBelow: 0,
    render: (c) => <UndoButton {...c} />,
  },
  {
    kind: "tool",
    id: "redo",
    hiddenAtOrBelow: 0,
    render: (c) => <RedoButton {...c} />,
  },

  { kind: "separator", id: "sep-history", hiddenAtOrBelow: 0 },
  {
    kind: "tool",
    id: "heading",
    hiddenAtOrBelow: 360,
    render: (c) => <HeadingsSelect {...c} />,
  },

  { kind: "separator", id: "sep-heading", hiddenAtOrBelow: 360 },
  {
    kind: "tool",
    id: "bullet",
    hiddenAtOrBelow: 580,
    render: (c) => <BulletListButton {...c} />,
  },
  {
    kind: "tool",
    id: "ordered",
    hiddenAtOrBelow: 580,
    render: (c) => <OrderedListButton {...c} />,
  },
  {
    kind: "tool",
    id: "task",
    hiddenAtOrBelow: 580,
    render: (c) => <TaskListButton {...c} />,
  },

  { kind: "separator", id: "sep-lists", hiddenAtOrBelow: 580 },
  {
    kind: "tool",
    id: "bold",
    hiddenAtOrBelow: 1350,
    render: (c) => <BoldButton {...c} />,
  },
  {
    kind: "tool",
    id: "italic",
    hiddenAtOrBelow: 1350,
    render: (c) => <ItalicButton {...c} />,
  },
  {
    kind: "tool",
    id: "underline",
    hiddenAtOrBelow: 1350,
    render: (c) => <UnderlineButton {...c} />,
  },
  {
    kind: "tool",
    id: "strike",
    hiddenAtOrBelow: 1350,
    render: (c) => <StrikeButton {...c} />,
  },
  {
    kind: "tool",
    id: "blockquote",
    hiddenAtOrBelow: 1350,
    render: (c) => <BlockquoteButton {...c} />,
  },
  {
    kind: "tool",
    id: "codeblock",
    hiddenAtOrBelow: 1350,
    render: (c) => <CodeBlockButton {...c} />,
  },

  { kind: "separator", id: "sep-format", hiddenAtOrBelow: 1350 },
  {
    kind: "tool",
    id: "hr",
    hiddenAtOrBelow: 1450,
    render: (c) => <HorizontalRuleButton {...c} />,
  },

  { kind: "separator", id: "sep-hr", hiddenAtOrBelow: 1450 },
  {
    kind: "tool",
    id: "highlighter",
    hiddenAtOrBelow: 1550,
    render: (c) => <HighlighterControl {...c} />,
  },

  { kind: "separator", id: "sep-highlighter", hiddenAtOrBelow: 1550 },
  {
    kind: "tool",
    id: "tags",
    hiddenAtOrBelow: 1550,
    render: (c) => <TagsButton {...c} />,
  },
];

export function VerticalSeparator() {
  return <Separator orientation="vertical" className="h-full" />;
}
