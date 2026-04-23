"use client";
import { Editor, useEditorState } from "@tiptap/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toolBarStateSelector } from "@/lib/toolBarState";
import { EllipsisVertical } from "lucide-react";
import {
  HIDE_AT_OR_BELOW,
  SHOWN_AT_OR_BELOW,
  TOOLS,
  ToolCtx,
  VerticalSeparator,
} from "./toolbarItems";

export default function ToolBar({
  editor,
  note,
}: {
  editor: Editor | null;
  note?: Note;
}) {
  const editorState = useEditorState({
    editor,
    selector: toolBarStateSelector,
  });

  if (editor === null) return null;

  const ctx: ToolCtx = { editor, editorState: editorState ?? undefined, note };

  // Tools that ever overflow into the menu (hiddenAtOrBelow > 0).
  const overflowTools = TOOLS.filter((t) => t.hiddenAtOrBelow > 0);

  return (
    <div className="p-3 px-6 min-w-0 w-full flex flex-nowrap items-center gap-5 border-b dark:text-[#a1a1a1] border-neutral-200 dark:border-white/10">
      {TOOLS.map((item) => {
        const hideClass = HIDE_AT_OR_BELOW[item.hiddenAtOrBelow] ?? "";
        if (item.kind === "separator") {
          return (
            <div key={item.id} className={`${hideClass} shrink-0 h-full`}>
              <VerticalSeparator />
            </div>
          );
        }
        return (
          <div key={item.id} className={hideClass}>
            {item.render(ctx)}
          </div>
        );
      })}

      {/* Overflow menu — trigger is hidden once viewport is wide enough that
          nothing overflows (above the largest breakpoint used in TOOLS). */}
      <div className="flex items-center min-[1601px]:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="hover:bg-primary/10 dark:hover:bg-neutral-800 p-2 rounded-full"
            title="More"
          >
            <EllipsisVertical />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="flex flex-wrap items-center gap-2 p-2 w-72"
          >
            {overflowTools.map((item) => {
              const showClass = SHOWN_AT_OR_BELOW[item.hiddenAtOrBelow] ?? "";
              if (item.kind === "separator") {
                return (
                  <div
                    key={item.id}
                    className={`${showClass} shrink-0 h-8 *:bg-neutral-600`}
                  >
                    <VerticalSeparator />
                  </div>
                );
              }

              return (
                <div key={item.id} className={showClass}>
                  {item.render(ctx)}
                </div>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
