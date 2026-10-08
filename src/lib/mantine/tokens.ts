/**
 * Alimenta design tokens — the single place the look of the app is defined.
 *
 * Values come from the Claude Design "Alimenta v2" frame (its `THEMES` object
 * for colors, its inline styles for spacing/radius/type). Change something
 * here and it propagates everywhere:
 *
 * - `theme.ts` builds the Mantine theme from these (palettes, scales, fonts,
 *   component defaults), and emits the color-scheme CSS variables through
 *   Mantine's `cssVariablesResolver`.
 * - Components reference the scales by key (`p="md"`, `radius="lg"`,
 *   `fz="sm"`) and the colors by variable (`c="var(--tx2)"`), never by raw
 *   value.
 *
 * To change the font: swap the `next/font` loader in `src/app/layout.tsx`
 * (it exposes `--font-sans` / `--font-mono`); nothing else needs to move.
 */

import type { MantineColorsTuple } from "@mantine/core";

/* ------------------------------------------------------------------ fonts */

export const fonts = {
    sans: "var(--font-sans), Geist, system-ui, sans-serif",
    mono: "var(--font-mono), 'Geist Mono', ui-monospace, monospace",
};

/* ----------------------------------------------------------------- colors */

/**
 * Mantine palettes (10 shades, light → dark). Shade 5 is the dark-scheme
 * accent and shade 7 the light-scheme one; `theme.ts` points `primaryShade`
 * at them, and Mantine uses `primaryShade` for the filled variant of every
 * color, so all tuples follow that convention.
 */
export const palettes = {
    /** Green accent — `#3bd692` (dark) / `#12936a` (light). */
    alimenta: [
        "#effdf6",
        "#d9f8ea",
        "#b4f0d5",
        "#86e5bb",
        "#5ddba3",
        "#3bd692",
        "#23bf7c",
        "#12936a",
        "#0f7556",
        "#0b5c45",
    ],
    /** Blue — `#60a5fa` / `#2f6fe4`. Dinner, energy, gradients. */
    sky: [
        "#eef5ff",
        "#d9e8ff",
        "#b6d3fe",
        "#8fbcfd",
        "#74b0fb",
        "#60a5fa",
        "#4a8df0",
        "#2f6fe4",
        "#2559c0",
        "#1d479a",
    ],
    /** Amber — `#fbbf24` / `#c26a00`. Breakfast, warnings, host crown. */
    amber: [
        "#fff8e6",
        "#ffeec2",
        "#ffe08f",
        "#fdd15c",
        "#fcc83a",
        "#fbbf24",
        "#e9a60f",
        "#c26a00",
        "#9d5600",
        "#7a4300",
    ],
    /** Rose — `#f472b6` / `#d0266f`. Snacks, errors, destructive. */
    rose: [
        "#fff0f7",
        "#ffdcec",
        "#ffbdd9",
        "#fb9bc6",
        "#f786bd",
        "#f472b6",
        "#e9509c",
        "#d0266f",
        "#a81e5a",
        "#86194a",
    ],
    /**
     * Dark-scheme neutrals. Mantine reaches for `dark-4`…`dark-8` as its
     * hover, disabled, surface, body and border colors, so these are the
     * scheme's `--sf2`, `--sf` and `--bg` with the text tiers at the light end.
     */
    dark: [
        "#eef4f0",
        "#a3b0a8",
        "#6f7c75",
        "#4a5650",
        "#1f2622",
        "#1a211d",
        "#161c19",
        "#0d110f",
        "#070908",
        "#040605",
    ],
    /** Light-scheme neutrals, green-grey to match the design's surfaces. */
    gray: [
        "#f7f8f7",
        "#eff3f0",
        "#e2e8e4",
        "#cfd7d2",
        "#b4beb8",
        "#86928b",
        "#4f5c54",
        "#36413b",
        "#1f2823",
        "#0f1712",
    ],
} satisfies Record<string, MantineColorsTuple>;

/**
 * Semantic colors per color scheme. Each key becomes a CSS variable with the
 * same name (`bg` → `--bg`), so components use them as `bg="var(--sf)"`.
 *
 *   bg    page base            sf   card surface        sf2  inset surface
 *   tx    primary text         tx2  secondary text      tx3  captions
 *   bd    hairline border      bd2  stronger border (inputs, chips)
 *   ac    accent               act  ink on accent       acs  accent tint
 *   bl    blue   am amber      ro   rose
 *   glass translucent panel    sh   card shadow         wash page background
 */
export const schemes = {
    dark: {
        bg: "#070908",
        sf: "#0d110f",
        sf2: "#161c19",
        bd: "rgba(235, 245, 238, 0.07)",
        bd2: "rgba(235, 245, 238, 0.14)",
        tx: "#eef4f0",
        tx2: "#a3b0a8",
        tx3: "#6f7c75",
        ac: "#3bd692",
        act: "#04110a",
        acs: "rgba(59, 214, 146, 0.14)",
        bl: "#60a5fa",
        am: "#fbbf24",
        ro: "#f472b6",
        glass: "rgba(18, 24, 21, 0.62)",
        sh: "0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 14px 36px rgba(0, 0, 0, 0.3)",
        wash: "radial-gradient(1100px 600px at 10% -10%, rgba(59, 214, 146, 0.18), transparent 60%), radial-gradient(900px 700px at 100% 110%, rgba(96, 165, 250, 0.14), transparent 60%), #070a09",
    },
    light: {
        bg: "#f7f8f7",
        sf: "#ffffff",
        sf2: "#eff3f0",
        bd: "rgba(16, 30, 22, 0.08)",
        bd2: "rgba(16, 30, 22, 0.15)",
        tx: "#0f1712",
        tx2: "#4f5c54",
        tx3: "#86928b",
        ac: "#12936a",
        act: "#ffffff",
        acs: "rgba(18, 147, 106, 0.12)",
        bl: "#2f6fe4",
        am: "#c26a00",
        ro: "#d0266f",
        glass: "rgba(255, 255, 255, 0.72)",
        sh: "0 1px 2px rgba(16, 30, 22, 0.04), 0 14px 36px rgba(16, 30, 22, 0.08)",
        wash: "radial-gradient(1100px 600px at 10% -10%, rgba(59, 214, 146, 0.26), transparent 60%), radial-gradient(900px 700px at 100% 110%, rgba(96, 165, 250, 0.24), transparent 60%), #f1f5f2",
    },
} as const;

export type SchemeToken = keyof typeof schemes.dark;

/** Colors that are the same in both schemes. */
export const shared = {
    /** Ink on the green→blue gradient, which stays bright in both schemes. */
    inkOnGradient: "#04110a",
    gradientAccent: "linear-gradient(135deg, #3bd692, #60a5fa)",
    /** Wheel slice colors, in order. */
    wheel: [
        "#3bd692",
        "#60a5fa",
        "#fbbf24",
        "#f472b6",
        "#a78bfa",
        "#2dd4bf",
        "#fb923c",
        "#38bdf8",
        "#e879f9",
        "#4ade80",
    ],
};

/* ----------------------------------------------------------------- scales */

/** Spacing, in px. `md` (12) is the page grid gap; `xl` (22) is card padding. */
export const spacing = {
    xxs: 4,
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 22,
    xxl: 28,
};

/** Border radii, in px. `pill` is fully round. */
export const radius = {
    xs: 8,
    sm: 11,
    md: 14,
    lg: 16,
    xl: 24,
    xxl: 28,
    pill: 999,
};

/** Font sizes, in px. `md` (14) is body text. */
export const fontSizes = {
    xxs: 11,
    xs: 12,
    sm: 13,
    md: 14,
    lg: 16,
    xl: 17,
    xxl: 22,
    display: 36,
};

/** Heading sizes, in px, by `Title` order. */
export const headingSizes = {
    h1: 30,
    h2: 24,
    h3: 17,
    h4: 16,
    h5: 15,
    h6: 13,
};

export const lineHeights = {
    xs: "1.15",
    sm: "1.3",
    md: "1.45",
    lg: "1.55",
    xl: "1.65",
};

export const fontWeights = {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
};

export const letterSpacing = {
    tight: "-0.035em",
    snug: "-0.02em",
    normal: "0",
    wide: "0.07em",
};

export const shadows = {
    xs: "0 1px 2px rgba(0, 0, 0, 0.08)",
    sm: "0 6px 18px rgba(0, 0, 0, 0.12)",
    /** The card shadow; follows the color scheme. */
    md: "var(--sh)",
    lg: "0 20px 50px rgba(0, 0, 0, 0.3)",
    xl: "0 40px 100px rgba(0, 0, 0, 0.45)",
};

export const motion = {
    fast: "150ms ease",
    normal: "160ms ease",
    slow: "300ms ease",
    spring: "cubic-bezier(0.2, 0.8, 0.2, 1)",
};

/** Control heights, in px (buttons, inputs). */
export const controlSizes = {
    xs: 30,
    sm: 36,
    md: 42,
    lg: 48,
    xl: 54,
};

/* -------------------------------------------------- Mantine type augmentation */

type SizeKeys<T> = Record<keyof T, string>;

declare module "@mantine/core" {
    export interface MantineThemeSizesOverride {
        spacing: SizeKeys<typeof spacing>;
        radius: SizeKeys<typeof radius>;
        fontSizes: SizeKeys<typeof fontSizes>;
        lineHeights: SizeKeys<typeof lineHeights>;
        fontWeights: SizeKeys<typeof fontWeights>;
    }

    export interface MantineThemeOther {
        letterSpacing: typeof letterSpacing;
        motion: typeof motion;
        controlSizes: typeof controlSizes;
        shared: typeof shared;
    }
}
