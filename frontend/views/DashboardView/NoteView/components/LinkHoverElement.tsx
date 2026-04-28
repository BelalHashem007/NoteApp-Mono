"use client";
import { Editor } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  computePosition,
  flip,
  shift,
  offset,
  autoUpdate,
} from "@floating-ui/dom";
import { Pencil, Trash2 } from "lucide-react";

export function LinkHoverElement({ editor }: { editor: Editor }) {
  const [anchorElement, setAnchorElement] = useState<HTMLAnchorElement | null>(
    null,
  );
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editedHref, setEditedHref] = useState<string | undefined>(undefined);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const anchorPositionRef = useRef<number | null>(null);

  const stopTrackingAnchor = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
  }, []);

  const startTrackingAnchor = useCallback(
    (a: HTMLAnchorElement) => {
      if (!tooltipRef.current) return;

      stopTrackingAnchor();

      anchorPositionRef.current = editor.view.posAtDOM(a, 0);
      setAnchorElement(a);
      setEditedHref(a.href);

      cleanupRef.current = autoUpdate(a, tooltipRef.current, () => {
        computePosition(a, tooltipRef.current as HTMLDivElement, {
          placement: "bottom",
          middleware: [offset(6), flip(), shift({ padding: 10 })],
        }).then(({ x, y }) => {
          Object.assign(tooltipRef.current?.style || {}, {
            left: `${x}px`,
            top: `${y}px`,
          });
        });
      });

      setIsOpen(true);
    },
    [editor, stopTrackingAnchor],
  );

  useEffect(() => {
    const handleMouseClick = (e: Event) => {
      const a = (e.target as HTMLElement).closest("a");

      if (tooltipRef.current && a) {
        startTrackingAnchor(a);
      } else {
        setIsOpen(false);
        setIsEdit(false);
        stopTrackingAnchor();
      }
    };

    const dom = editor.view.dom;
    dom.addEventListener("click", handleMouseClick);

    return () => {
      dom.removeEventListener("click", handleMouseClick);
      stopTrackingAnchor();
    };
  }, [editor, startTrackingAnchor, stopTrackingAnchor]);

  return (
    <div
      ref={tooltipRef}
      className={`dark:bg-neutral-700 dark:border-0 border border-neutral-200 bg-white shadow p-4 w-auto absolute gap-4 items-center top-0 left-0 ${isOpen ? "flex" : "hidden"} z-50`}
    >
      {isEdit ? (
        <input
          type="text"
          value={editedHref}
          autoFocus
          onChange={(e) => setEditedHref(e.target.value)}
          className="p-2 border bg-neutral-200 w-auto min-w-70 rounded-md dark:border-neutral-500 dark:bg-neutral-600 dark:focus:outline-neutral-600"
        />
      ) : (
        <a
          href={editedHref}
          className="dark:text-[lightblue] text-blue-500 inline-block underline text-wrap max-w-70 break-all"
          rel="noopener noreferrer nofollow"
          target="_blank"
        >
          {editedHref}
        </a>
      )}
      <div className="flex gap-3">
        {isEdit ? (
          <>
            <button
              className="size-6 bg-neutral-900 text-white rounded-full items-center flex justify-center"
              onClick={() => {
                setEditedHref(anchorElement?.href);
                setIsEdit(false);
              }}
            >
              X
            </button>
            <button
              className="size-6 bg-neutral-900 text-white rounded-full items-center flex justify-center"
              onClick={() => {
                const anchorPosition = anchorPositionRef.current;

                editor
                  .chain()
                  .focus()
                  .extendMarkRange("link", { href: anchorElement?.href })
                  .updateAttributes("link", { href: editedHref })
                  .run();
                setIsEdit(false);

                requestAnimationFrame(() => {
                  if (anchorPosition === null) return;

                  const domAtPosition =
                    editor.view.domAtPos(anchorPosition).node;
                  if (domAtPosition.hasChildNodes()) {
                    for (const node of domAtPosition.childNodes) {
                      if (node instanceof HTMLAnchorElement) {
                        startTrackingAnchor(node);
                      }
                    }
                  }
                });
              }}
            >
              ✓
            </button>
          </>
        ) : (
          <>
            {" "}
            <button onClick={() => setIsEdit(true)}>
              <Pencil className="size-5 dark:text-neutral-300 text-neutral-900" />
            </button>
            <button
              onClick={() => {
                editor.commands.unsetMark("link", {
                  extendEmptyMarkRange: true,
                });
                setIsOpen(false);
              }}
            >
              <Trash2 className="size-5 dark:text-neutral-300 text-neutral-900" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
