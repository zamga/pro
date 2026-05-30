/**
 * Shared contract for the weighted custom cursor (see components/CustomCursor.tsx).
 *
 * Any interactive element can opt into a contextual cursor label by setting
 * `data-cursor="<key>"`. The cursor reads the attribute on hover, expands, and
 * renders the matching label centered inside the pointer circle.
 */
export const CURSOR_LABELS = {
  discover: "DISCOVER",
  decrypt: "DECRYPT",
  solutions: "SOLUTIONS",
  connect: "CONNECT",
} as const;

export type CursorKey = keyof typeof CURSOR_LABELS;

/** The data attribute the cursor watches for. */
export const CURSOR_ATTR = "data-cursor";
