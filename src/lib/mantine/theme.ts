import type { CSSProperties } from "react";
import {
    ActionIcon,
    Avatar,
    Button,
    Card,
    Input,
    Modal,
    NavLink,
    Notification,
    Switch,
    Tabs,
    ThemeIcon,
    Title,
    createTheme,
    defaultVariantColorsResolver,
    rem,
    type MantineColorsTuple,
    type VariantColorsResolver,
} from "@mantine/core";

/**
 * Alimenta v2 theme — the single place component styling is defined.
 *
 * Every color below is paired with a CSS custom property declared in
 * `src/app/globals.css` (`--ac`, `--sf`, `--tx2`, …); Mantine's own variables
 * (`--mantine-color-body`, `--mantine-primary-color-filled`, …) are bridged to
 * those tokens there too. The palette tuples here feed Mantine's shade math
 * (hover states, `light` tints, gradients) and `color="sky"`-style props.
 * Shade 5 is the dark-scheme accent, shade 7 the light-scheme one —
 * `primaryShade` points at them, and since Mantine uses `primaryShade` for the
 * filled variant of *every* color the other tuples follow the same rule.
 *
 * Component styling uses `defaultProps`, `vars` (Mantine's own CSS variables,
 * which its hover/focus rules consume) and `styles` (inline, per element).
 * This module contains functions, so it must only be imported from a client
 * module — see `src/providers/MantineThemeProvider.tsx`.
 */

/** Green accent — `#3bd692` (dark) / `#12936a` (light). */
const alimenta: MantineColorsTuple = [
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
];

/** Blue — `#60a5fa` (dark) / `#2f6fe4` (light). Dinner, energy, gradients. */
const sky: MantineColorsTuple = [
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
];

/** Amber — `#fbbf24` (dark) / `#c26a00` (light). Breakfast, warnings, host crown. */
const amber: MantineColorsTuple = [
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
];

/** Rose — `#f472b6` (dark) / `#d0266f` (light). Snacks, errors, destructive. */
const rose: MantineColorsTuple = [
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
];

/**
 * Dark-scheme neutrals. Mantine reaches for `dark-4`…`dark-8` as its hover,
 * disabled, surface, body and border colors, so these are the design's
 * `--sf2`, `--sf` and `--bg` with the text tiers at the light end.
 */
const dark: MantineColorsTuple = [
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
];

/** Light-scheme neutrals, tuned green-grey to match the design's surfaces. */
const gray: MantineColorsTuple = [
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
];

/**
 * Extra button/badge/action-icon variants on top of Mantine's defaults, all
 * expressed in the design tokens so they follow the color scheme:
 *
 * - `default` — the design's secondary button: transparent, `--bd2` border,
 *   `--sf2` on hover.
 * - `subtle` (primary or gray) — neutral ghost: `--tx2` text, `--sf2` hover.
 * - `surface` — `--sf2` chip, e.g. "Copy link", "Undo".
 * - `glass` — translucent pill used for the header controls.
 * - `light` on the primary color — `--acs` tint with `--ac` text.
 */
const variantColorResolver: VariantColorsResolver = (input) => {
    const defaults = defaultVariantColorsResolver(input);
    const isPrimary = !input.color || input.color === input.theme.primaryColor;

    switch (input.variant) {
        case "default":
            return {
                background: "transparent",
                hover: "var(--sf2)",
                color: "var(--tx)",
                border: "1px solid var(--bd2)",
            };
        case "subtle":
            if (!isPrimary && input.color !== "gray") return defaults;
            return {
                background: "transparent",
                hover: "var(--sf2)",
                color: "var(--tx2)",
                hoverColor: "var(--tx)",
                border: "none",
            };
        case "surface":
            return {
                background: "var(--sf2)",
                hover: "color-mix(in srgb, var(--sf2) 70%, var(--bd2))",
                color: "var(--tx)",
                border: "none",
            };
        case "glass":
            return {
                background: "var(--glass)",
                hover: "var(--glass)",
                color: "var(--tx2)",
                hoverColor: "var(--tx)",
                border: "1px solid var(--bd)",
            };
        case "light":
            if (!isPrimary) return defaults;
            return {
                background: "var(--acs)",
                hover: "color-mix(in srgb, var(--acs) 70%, var(--ac))",
                color: "var(--ac)",
                border: "none",
            };
        default:
            return defaults;
    }
};

type SizeSpec = [height: string, paddingX: string, fontSize: string];

const BUTTON_SIZES: Record<string, SizeSpec> = {
    xs: ["30px", "12px", "12px"],
    sm: ["36px", "14px", "13px"],
    md: ["42px", "20px", "14px"],
    lg: ["48px", "22px", "15px"],
    xl: ["54px", "30px", "17px"],
};

const INPUT_SIZES: Record<string, SizeSpec> = {
    xs: ["32px", "12px", "13px"],
    sm: ["38px", "12px", "13px"],
    md: ["44px", "14px", "14px"],
    lg: ["48px", "16px", "16px"],
    xl: ["54px", "18px", "17px"],
};

/** Inline custom properties need a cast — `CSSProperties` doesn't know `--x`. */
const cssVars = (vars: Record<`--${string}`, string>) => vars as CSSProperties;

const PANEL_SHADOW = "0 40px 100px rgba(0, 0, 0, 0.45)";
const FLOAT_SHADOW = "0 20px 50px rgba(0, 0, 0, 0.3)";
const MOTION = "150ms ease";

export const alimentaTheme = createTheme({
    primaryColor: "alimenta",
    primaryShade: { light: 7, dark: 5 },
    // Filled surfaces pick black or white text by luminance; `black` is the
    // design's ink-on-green (`--act`), not pure black.
    autoContrast: true,
    luminanceThreshold: 0.4,
    black: "#04110a",
    white: "#ffffff",
    colors: { alimenta, sky, amber, rose, dark, gray },
    variantColorResolver,
    defaultGradient: { from: "alimenta", to: "sky", deg: 135 },

    fontFamily: "var(--font-geist-sans), Geist, system-ui, sans-serif",
    fontFamilyMonospace:
        "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace",
    fontSmoothing: true,
    headings: {
        fontFamily: "var(--font-geist-sans), Geist, system-ui, sans-serif",
        fontWeight: "700",
        textWrap: "balance",
        sizes: {
            h1: { fontSize: rem(30), lineHeight: "1.15" },
            h2: { fontSize: rem(24), lineHeight: "1.15" },
            h3: { fontSize: rem(17), lineHeight: "1.25" },
            h4: { fontSize: rem(16), lineHeight: "1.3" },
            h5: { fontSize: rem(15), lineHeight: "1.3" },
            h6: { fontSize: rem(13), lineHeight: "1.4" },
        },
    },

    // Rounded everything: fields 14, rows 16-18, cards 24. Pills use `999px`.
    radius: {
        xs: rem(8),
        sm: rem(10),
        md: rem(14),
        lg: rem(18),
        xl: rem(24),
    },
    defaultRadius: "md",
    shadows: {
        xs: "0 1px 2px rgba(0, 0, 0, 0.08)",
        sm: "0 6px 18px rgba(0, 0, 0, 0.12)",
        md: "var(--sh)",
        lg: FLOAT_SHADOW,
        xl: PANEL_SHADOW,
    },
    cursorType: "pointer",
    respectReducedMotion: true,

    components: {
        /* ---------------------------------------------------- buttons */
        Button: Button.extend({
            defaultProps: { radius: "999px" },
            vars: (_theme, props) => {
                const [height, paddingX, fontSize] =
                    BUTTON_SIZES[String(props.size ?? "md")] ?? BUTTON_SIZES.md;

                return {
                    root: {
                        "--button-height": height,
                        "--button-padding-x": paddingX,
                        "--button-fz": fontSize,
                    },
                };
            },
            styles: (_theme, props) => {
                const glows =
                    (props.variant === "filled" ||
                        props.variant === "gradient" ||
                        props.variant === undefined) &&
                    !props.disabled &&
                    !props.loading;

                return {
                    root: {
                        fontWeight: 600,
                        transition: `transform ${MOTION}, box-shadow ${MOTION}, background-color ${MOTION}, color ${MOTION}`,
                        boxShadow: glows
                            ? props.variant === "gradient"
                                ? "0 14px 34px var(--acs)"
                                : "0 10px 26px color-mix(in srgb, var(--button-bg, var(--ac)) 26%, transparent)"
                            : "none",
                        backdropFilter:
                            props.variant === "glass"
                                ? "blur(20px)"
                                : undefined,
                    },
                    section: { marginInline: 0 },
                };
            },
        }),
        ActionIcon: ActionIcon.extend({
            defaultProps: { radius: "999px", variant: "glass", size: 42 },
            styles: (_theme, props) => ({
                root: {
                    backdropFilter:
                        props.variant === "glass" ? "blur(20px)" : undefined,
                    transition: `transform ${MOTION}, color ${MOTION}, background-color ${MOTION}`,
                },
            }),
        }),
        CloseButton: {
            defaultProps: { radius: "999px" },
        },
        ThemeIcon: ThemeIcon.extend({
            // The design's 34px icon tile, accent-tinted by default; pass
            // `color="amber"` etc. for meal types, `variant="gradient"` for
            // the brand mark.
            defaultProps: { variant: "light", radius: 11, size: 34 },
            styles: (_theme, props) => ({
                root: {
                    color:
                        props.variant === "gradient"
                            ? "var(--ink-on-gradient)"
                            : undefined,
                },
            }),
        }),

        /* --------------------------------------------------- surfaces */
        Card: Card.extend({
            defaultProps: {
                radius: "xl",
                shadow: "md",
                withBorder: true,
                padding: 22,
            },
            styles: {
                root: {
                    backgroundColor: "var(--sf)",
                    borderColor: "var(--bd)",
                },
            },
        }),
        Paper: {
            defaultProps: { radius: "xl", shadow: "md", withBorder: true },
            styles: {
                root: {
                    backgroundColor: "var(--sf)",
                    borderColor: "var(--bd)",
                },
            },
        },
        Avatar: Avatar.extend({
            defaultProps: { variant: "gradient", radius: "xl" },
            styles: (_theme, props) => ({
                placeholder: {
                    fontWeight: 700,
                    color:
                        props.variant === "gradient" || !props.variant
                            ? "var(--ink-on-gradient)"
                            : undefined,
                },
            }),
        }),

        /* --------------------------------------------------- overlays */
        Modal: Modal.extend({
            defaultProps: {
                radius: 28,
                padding: 26,
                centered: true,
                overlayProps: { blur: 8, backgroundOpacity: 0.45 },
                transitionProps: { transition: "pop", duration: 240 },
            },
            styles: {
                content: {
                    backgroundColor: "var(--sf)",
                    border: "1px solid var(--bd)",
                    boxShadow: PANEL_SHADOW,
                    color: "var(--tx)",
                },
                header: { backgroundColor: "transparent" },
                title: {
                    fontSize: rem(22),
                    fontWeight: 700,
                    letterSpacing: "-0.025em",
                },
                close: {
                    width: rem(34),
                    height: rem(34),
                    minWidth: rem(34),
                    minHeight: rem(34),
                    borderRadius: 999,
                    backgroundColor: "var(--sf2)",
                    color: "var(--tx2)",
                },
            },
        }),
        Drawer: {
            defaultProps: {
                padding: "md",
                overlayProps: { blur: 8, backgroundOpacity: 0.45 },
            },
            styles: {
                content: {
                    backgroundColor: "var(--sf)",
                    border: "1px solid var(--bd)",
                    boxShadow: PANEL_SHADOW,
                    color: "var(--tx)",
                },
                header: { backgroundColor: "transparent" },
                title: {
                    fontSize: rem(22),
                    fontWeight: 700,
                    letterSpacing: "-0.025em",
                },
                close: {
                    width: rem(34),
                    height: rem(34),
                    minWidth: rem(34),
                    minHeight: rem(34),
                    borderRadius: 999,
                    backgroundColor: "var(--sf2)",
                    color: "var(--tx2)",
                },
            },
        },
        Menu: {
            defaultProps: { radius: "lg", shadow: "lg" },
            styles: {
                dropdown: {
                    backgroundColor: "var(--sf)",
                    borderColor: "var(--bd2)",
                    padding: rem(6),
                },
                item: { borderRadius: rem(10), fontWeight: 500 },
                itemLabel: { color: "var(--tx)" },
                label: { color: "var(--tx3)", fontWeight: 600 },
                divider: { borderColor: "var(--bd)" },
            },
        },
        Popover: {
            defaultProps: { radius: "lg", shadow: "lg" },
            styles: {
                dropdown: {
                    backgroundColor: "var(--sf)",
                    borderColor: "var(--bd2)",
                },
            },
        },
        Combobox: {
            styles: {
                dropdown: {
                    backgroundColor: "var(--sf)",
                    borderColor: "var(--bd2)",
                    padding: rem(6),
                },
                option: { borderRadius: rem(10), fontWeight: 500 },
            },
        },
        Tooltip: {
            defaultProps: { radius: "sm" },
            styles: {
                tooltip: {
                    backgroundColor: "var(--tx)",
                    color: "var(--bg)",
                    fontWeight: 500,
                },
            },
        },

        /* ----------------------------------------------------- inputs */
        Input: Input.extend({
            vars: (_theme, props) => {
                const [height, paddingX, fontSize] =
                    INPUT_SIZES[String(props.size ?? "md")] ?? INPUT_SIZES.md;

                return {
                    wrapper: {
                        "--input-height": height,
                        "--input-padding-inline-start": paddingX,
                        "--input-padding-inline-end": paddingX,
                        "--input-fz": fontSize,
                        "--input-bg": "var(--sf2)",
                        "--input-bd": props.error ? "var(--ro)" : "var(--bd2)",
                        "--input-bd-focus": props.error
                            ? "var(--ro)"
                            : "var(--ac)",
                        "--input-color": "var(--tx)",
                        "--input-placeholder-color": "var(--tx3)",
                        "--input-section-color": "var(--tx3)",
                    },
                };
            },
            styles: (_theme, props) => ({
                input: {
                    fontWeight: 500,
                    transition: `border-color ${MOTION}, box-shadow ${MOTION}`,
                    animation: props.error ? "alm-shake 400ms ease" : undefined,
                },
            }),
        }),
        InputWrapper: {
            styles: {
                label: {
                    fontSize: rem(12),
                    fontWeight: 600,
                    color: "var(--tx2)",
                    marginBottom: rem(6),
                },
                description: { color: "var(--tx3)", fontSize: rem(12) },
                error: {
                    fontSize: rem(12),
                    fontWeight: 500,
                    color: "var(--ro)",
                },
            },
        },
        Textarea: {
            defaultProps: { minRows: 4 },
            styles: {
                input: {
                    paddingTop: rem(12),
                    paddingBottom: rem(12),
                    lineHeight: 1.5,
                },
            },
        },
        Switch: Switch.extend({
            defaultProps: { color: "alimenta" },
            // 46×28 track with a 22px thumb, per the design's AI toggles.
            vars: () => ({
                root: {
                    "--switch-width": rem(46),
                    "--switch-height": rem(28),
                    "--switch-thumb-size": rem(22),
                    "--switch-radius": rem(999),
                },
            }),
            styles: {
                track: {
                    ...cssVars({ "--switch-bg": "var(--bd2)" }),
                    border: "none",
                    cursor: "pointer",
                },
                thumb: {
                    border: "none",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.25)",
                },
            },
        }),
        Checkbox: {
            defaultProps: { radius: rem(7), color: "alimenta" },
            styles: {
                input: {
                    backgroundColor: "transparent",
                    borderColor: "var(--bd2)",
                },
            },
        },
        Radio: {
            defaultProps: { color: "alimenta" },
        },
        SegmentedControl: {
            defaultProps: { radius: "999px" },
            styles: {
                root: { backgroundColor: "var(--sf2)", padding: rem(3) },
                indicator: {
                    backgroundColor: "var(--sf)",
                    boxShadow: "var(--sh)",
                },
                label: { fontWeight: 600, fontSize: rem(13) },
            },
        },

        /* ------------------------------------------------- navigation */
        Tabs: Tabs.extend({
            // Pill tabs: glass track, raised `--sf` pill for the active tab.
            defaultProps: { variant: "pills", radius: "999px" },
            vars: () => ({
                root: { "--tabs-color": "var(--sf)" },
            }),
            styles: {
                root: cssVars({ "--tabs-text-color": "var(--tx)" }),
                list: {
                    display: "inline-flex",
                    gap: rem(2),
                    padding: rem(4),
                    borderRadius: 999,
                    backgroundColor: "var(--glass)",
                    border: "1px solid var(--bd)",
                    backdropFilter: "blur(20px)",
                },
                tab: {
                    height: rem(38),
                    paddingInline: rem(18),
                    fontWeight: 600,
                    fontSize: rem(13),
                    transition: `background-color ${MOTION}, color ${MOTION}`,
                },
            },
        }),
        NavLink: NavLink.extend({
            // Sidebar rows: 40px, 13px radius, raised `--sf` when active.
            vars: () => ({
                root: {
                    "--nl-bg": "var(--sf)",
                    "--nl-hover": "var(--sf2)",
                    "--nl-color": "var(--tx)",
                },
                children: {},
            }),
            styles: (_theme, props) => ({
                root: {
                    height: rem(40),
                    paddingInline: rem(12),
                    borderRadius: rem(13),
                    color: props.active ? "var(--tx)" : "var(--tx2)",
                    boxShadow: props.active ? "var(--sh)" : "none",
                    transition: `background-color ${MOTION}, color ${MOTION}`,
                },
                label: { fontWeight: 500, fontSize: rem(14) },
                section: { color: props.active ? "var(--ac)" : undefined },
            }),
        }),

        /* ------------------------------------------------- data/feedback */
        Badge: {
            defaultProps: { radius: "999px", variant: "light", tt: "none" },
            styles: {
                root: {
                    fontWeight: 700,
                    letterSpacing: 0,
                    height: rem(26),
                    paddingInline: rem(10),
                    fontSize: rem(12),
                },
            },
        },
        Chip: {
            defaultProps: { radius: "999px" },
        },
        Pill: {
            defaultProps: { radius: "999px" },
        },
        Loader: {
            defaultProps: { color: "alimenta", type: "dots" },
        },
        Progress: {
            defaultProps: { radius: "999px", color: "alimenta" },
            styles: { root: { backgroundColor: "var(--sf2)" } },
        },
        RingProgress: {
            defaultProps: { rootColor: "var(--sf2)" },
        },
        Skeleton: {
            defaultProps: { radius: "md" },
        },
        Divider: {
            defaultProps: { color: "var(--bd)" },
        },
        Alert: {
            defaultProps: { radius: "lg", variant: "light" },
            styles: { root: { border: "1px solid var(--bd)" } },
        },
        Notification: Notification.extend({
            // Glass toast with a tinted icon tile; `lib/notifications.tsx`
            // picks the tile color and glyph per kind.
            defaultProps: { radius: 18, withBorder: true },
            styles: {
                root: {
                    backgroundColor: "var(--glass)",
                    borderColor: "var(--bd2)",
                    backdropFilter: "blur(24px)",
                    boxShadow: FLOAT_SHADOW,
                    padding: `${rem(12)} ${rem(12)} ${rem(12)} ${rem(14)}`,
                    animation: "alm-in 320ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                },
                icon: {
                    width: rem(30),
                    height: rem(30),
                    borderRadius: rem(10),
                    marginInlineEnd: rem(12),
                },
                title: { color: "var(--tx)", fontWeight: 600 },
                description: { color: "var(--tx2)", fontSize: rem(12) },
                closeButton: { color: "var(--tx3)", borderRadius: rem(8) },
            },
        }),
        Table: {
            defaultProps: {
                verticalSpacing: "sm",
                horizontalSpacing: "md",
                highlightOnHover: true,
            },
            styles: {
                table: cssVars({
                    "--table-border-color": "var(--bd)",
                    "--table-hover-color": "var(--sf2)",
                    "--table-striped-color": "var(--sf2)",
                }),
                th: { color: "var(--tx3)", fontSize: rem(12), fontWeight: 600 },
            },
        },

        /* ------------------------------------------------- typography */
        Title: Title.extend({
            styles: (_theme, props) => ({
                root: {
                    letterSpacing:
                        props.order === 1 || props.order === 2
                            ? "-0.035em"
                            : props.order === 3
                              ? "-0.02em"
                              : "-0.01em",
                },
            }),
        }),
        Anchor: {
            defaultProps: { underline: "hover" },
        },
    },
});
