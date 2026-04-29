"use client";

import { Editor } from "@tiptap/react";
import { useState, useEffect, memo } from "react";
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
  Link,
  Image,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { checkImage } from "@/lib/utils";
import { SketchPicker } from "react-color";
import { useDebouncedCallback } from "use-debounce";
import { useTheme } from "@/app/providers";

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
  480: "max-[480px]:hidden",
  620: "max-[620px]:hidden",
  1120: "max-[1120px]:hidden",
  1350: "max-[1350px]:hidden",
  1450: "max-[1450px]:hidden",
  1600: "max-[1600px]:hidden",
};

/** Inverse of HIDE_AT_OR_BELOW: visible only when viewport is at/below the bp. */
export const SHOWN_AT_OR_BELOW: Record<number, string> = {
  0: "hidden",
  480: "min-[481px]:hidden",
  620: "min-[621px]:hidden",
  1120: "min-[1121px]:hidden",
  1350: "min-[1351px]:hidden",
  1450: "min-[1451px]:hidden",
  1600: "min-[1601px]:hidden",
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
          : "hover:bg-primary/10 dark:hover:bg-neutral-700"
      } rounded-full p-2 transition-colors duration-200 ${extraClassName}`}
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
      className="disabled:text-gray-400 disabled:hover:cursor-not-allowed disabled:cursor-not-allowed *:pointer-events-none rounded-full p-2 enabled:hover:bg-primary/10 enabled:dark:hover:bg-neutral-700 transition-colors duration-200"
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

const ColorPickerWrapper = memo(function ColorPicker({
  initialColor,
  onFinalChange,
}: {
  initialColor: string;
  onFinalChange: (a: string) => void;
}) {
  const [internalColor, setInternalColor] = useState(initialColor);
  const [theme] = useTheme();

  return (
    <SketchPicker
      color={internalColor}
      onChange={(c) => setInternalColor(c.hex)}
      onChangeComplete={(c) => onFinalChange(c.hex)}
      styles={{
        default: {
          picker: {
            background: theme === "dark" ? "#3B3B3B" : "transparent",
          },
        },
      }}
    />
  );
});

function HighlighterControl({ editor }: ToolCtx) {
  const [color, setColor] = useState("yellow");
  const [showPicker, setShowPicker] = useState<boolean>(false);

  const debounced = useDebouncedCallback((value: string) => {
    editor.chain().setHighlight({ color: value }).run();
  }, 50);

  const handleApplyColor = (hex: string) => {
    setColor(hex);
    debounced(hex);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger
          title="Highlighter"
          className="flex items-center justify-center border dark:border-neutral-700 rounded-full p-2 cursor-pointer hover:bg-primary/10 dark:hover:bg-neutral-700 transition-colors duration-200"
        >
          <Highlighter style={{ fill: color }} />
        </PopoverTrigger>
        <PopoverContent
          className="bg-transparent dark:bg-transparent ring-0 shadow-none flex items-center"
          onInteractOutside={(e) => {
            const target = e.target as HTMLElement;

            if (target.closest(".color-picker-class")) {
              e.preventDefault();
            }
          }}
        >
          <div className="color-picker-class">
            <ColorPickerWrapper
              initialColor={color}
              onFinalChange={handleApplyColor}
            />
          </div>
        </PopoverContent>
      </Popover>
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

function LinkButton({ editor }: ToolCtx) {
  const [url, setUrl] = useState<string>("https://");
  const [linkHref, setLinkHref] = useState<string | null>(null);

  useEffect(() => {
    const findLinkHref = () => {
      const { state } = editor;
      const { from, empty } = state.selection;
      const marks = empty
        ? state.doc.resolve(from).marks()
        : state.selection.$from.marks();
      const linkMark = marks.find((mark) => mark.type.name === "link");
      if (linkMark) {
        setLinkHref(linkMark.attrs.href);
      } else {
        setLinkHref(null);
      }
    };

    editor.on("selectionUpdate", findLinkHref);

    return () => {
      editor.off("selectionUpdate", findLinkHref);
    };
  }, [editor]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`${linkHref && "bg-primary/50 dark:bg-neutral-700 shadow text-white"} dark:hover:bg-neutral-700 transition-colors duration-200 p-2 rounded-full`}
          onClick={(e) => {
            if (linkHref) {
              e.preventDefault();
              editor.chain().focus().toggleLink({ href: linkHref }).run();
              setLinkHref(null);
            }
          }}
          title="Link"
        >
          <Link className="size-6" />
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <form
          className="flex-col flex gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleLink({ href: url }).run();
            setTimeout(() => {
              setUrl("https://");
              setLinkHref(null);
            }, 100);
          }}
        >
          <label className="flex flex-col gap-1">
            Link Url
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="border bg-neutral-100 dark:border-neutral-600 p-1 dark:bg-neutral-700 focus:outline-1"
            />
          </label>

          <button
            type="submit"
            className="p-2 rounded-md bg-blue-500 text-white dark:bg-blue-500/50"
          >
            Add Link
          </button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

function ImageButton({ editor }: ToolCtx) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState<string | null>(null);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={` hover:bg-primary/10 dark:hover:bg-neutral-700 transition-colors duration-200 p-2 rounded-full`}
          title="Image"
        >
          {/* eslint-disable-next-line */}
          <Image className="size-6" />
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <form
          className="flex-col flex gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (imgUrl && imgUrl.trim().length > 0) {
              checkImage(imgUrl).then((isValied) => {
                const finalUrl = isValied
                  ? imgUrl
                  : "https://placehold.co/400?text=Failed+To+Load+Image&font=roboto";
                editor
                  .chain()
                  .insertContent({
                    type: "imageResize",
                    attrs: {
                      src: finalUrl,
                      alt: altText ?? "Random image",
                    },
                  })
                  .focus()
                  .run();
                setImgUrl(null);
                setAltText(null);
              });
            }
          }}
        >
          <label className="flex flex-col gap-1">
            Image Url
            <input
              type="text"
              value={imgUrl || ""}
              onChange={(e) => setImgUrl(e.target.value)}
              placeholder="i.e. https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1274&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              className="border bg-neutral-100 dark:border-neutral-600 p-1 dark:bg-neutral-700 focus:outline-1"
            />
          </label>

          <label className="flex flex-col gap-1">
            Alt Text (useful for search)
            <input
              type="text"
              value={altText || ""}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Random image"
              className="border bg-neutral-100 dark:border-neutral-600 p-1 dark:bg-neutral-700 focus:outline-1"
            />
          </label>

          <button
            type="submit"
            className="p-2 rounded-md bg-blue-500 text-white disabled:cursor-not-allowed dark:bg-blue-500/50 disabled:text-gray-400 disabled:bg-gray-300"
            disabled={!imgUrl || imgUrl.trim().length === 0}
          >
            Add Image
          </button>
        </form>
      </PopoverContent>
    </Popover>
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
    hiddenAtOrBelow: 480,
    render: (c) => <HeadingsSelect {...c} />,
  },

  { kind: "separator", id: "sep-heading", hiddenAtOrBelow: 480 },
  {
    kind: "tool",
    id: "bullet",
    hiddenAtOrBelow: 620,
    render: (c) => <BulletListButton {...c} />,
  },
  {
    kind: "tool",
    id: "ordered",
    hiddenAtOrBelow: 620,
    render: (c) => <OrderedListButton {...c} />,
  },
  {
    kind: "tool",
    id: "task",
    hiddenAtOrBelow: 620,
    render: (c) => <TaskListButton {...c} />,
  },

  { kind: "separator", id: "sep-lists", hiddenAtOrBelow: 620 },
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
  {
    kind: "tool",
    id: "link",
    hiddenAtOrBelow: 1450,
    render: (c) => <LinkButton {...c} />,
  },
  {
    kind: "tool",
    id: "image",
    hiddenAtOrBelow: 1450,
    render: (c) => <ImageButton {...c} />,
  },

  { kind: "separator", id: "sep-hr", hiddenAtOrBelow: 1450 },
  {
    kind: "tool",
    id: "highlighter",
    hiddenAtOrBelow: 1600,
    render: (c) => <HighlighterControl {...c} />,
  },

  { kind: "separator", id: "sep-highlighter", hiddenAtOrBelow: 1600 },
  {
    kind: "tool",
    id: "tags",
    hiddenAtOrBelow: 1600,
    render: (c) => <TagsButton {...c} />,
  },
];

export function VerticalSeparator() {
  return <Separator orientation="vertical" className="h-full" />;
}
