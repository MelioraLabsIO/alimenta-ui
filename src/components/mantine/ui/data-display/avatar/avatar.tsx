"use client";

import type { ComponentProps } from "react";

/**
 * Circular frame holding a user's initials.
 *
 * Deliberately a plain element rather than Mantine's `Avatar`. Mantine sizes
 * its avatar from `--avatar-size` — including a `min-width` — in *unlayered*
 * CSS, while Tailwind v4 emits utilities into `@layer utilities`. Unlayered
 * rules win at equal specificity, so every `h-*`/`w-*` a call site passed was
 * silently ignored and the circle rendered as a squashed oval. Mantine also
 * wraps children in its own placeholder element, which paints a grey
 * background of its own beneath anything the caller tints.
 *
 * Sizing and color here are pure Tailwind, so `className` always wins.
 *
 * Centers and tints its children, so initials go straight inside it.
 *
 * There is no default size — pass `h-*`/`w-*`. A default would collide with
 * the caller's on the same property, and this shim has no `tailwind-merge`
 * to resolve that, so whichever class Tailwind emitted last would win.
 */
export const Avatar = ({ className = "", ...props }: ComponentProps<"span">) => (
    <span
        className={`relative flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-primary/20 font-semibold text-primary ${className}`}
        {...props}
    />
);
