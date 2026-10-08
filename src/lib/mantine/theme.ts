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
    type CSSVariablesResolver,
    type VariantColorsResolver,
} from "@mantine/core";
import {
    controlSizes,
    fontSizes,
    fontWeights,
    fonts,
    headingSizes,
    letterSpacing,
    lineHeights,
    motion,
    palettes,
    radius,
    schemes,
    shadows,
    shared,
    spacing,
    type SchemeToken,
} from "./tokens";

/**
 * The Mantine theme, built entirely from `tokens.ts`. Nothing visual is
 * hard-coded here: scales, fonts and colors come from the tokens, and the
 * per-component `defaultProps` / `vars` / `styles` reference them by key or
 * by CSS variable.
 *
 * This module contains functions, so it is only imported from the client-side
 * `src/providers/MantineThemeProvider.tsx`, never from a server component.
 */

const px = (value: number) => rem(value);
const toRem = <T extends Record<string, number>>(scale: T) =>
    Object.fromEntries(
        Object.entries(scale).map(([key, value]) => [key, px(value)])
    ) as Record<keyof T, string>;

/**
 * Extra button/badge/action-icon variants on top of Mantine's defaults, all in
 * scheme variables so they follow the color scheme:
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

/** Per-size button padding and font, keyed like `controlSizes`. */
const BUTTON_SIZES: Record<string, [paddingX: number, fontSize: number]> = {
    xs: [spacing.md, fontSizes.xs],
    sm: [spacing.lg - 2, fontSizes.sm],
    md: [20, fontSizes.md],
    lg: [spacing.xl, 15],
    xl: [30, fontSizes.xl],
};

/** Input heights deviate slightly from buttons (44 not 42 at `md`). */
const INPUT_SIZES: Record<
    string,
    [height: number, paddingX: number, fontSize: number]
> = {
    xs: [32, spacing.md, fontSizes.sm],
    sm: [38, spacing.md, fontSizes.sm],
    md: [44, spacing.md + 2, fontSizes.md],
    lg: [48, spacing.lg, fontSizes.lg],
    xl: [54, 18, fontSizes.xl],
};

/** Inline custom properties need a cast — `CSSProperties` doesn't know `--x`. */
const cssVars = (vars: Record<`--${string}`, string>) => vars as CSSProperties;

const closeButtonStyle = {
    width: px(34),
    height: px(34),
    minWidth: px(34),
    minHeight: px(34),
    borderRadius: radius.pill,
    backgroundColor: "var(--sf2)",
    color: "var(--tx2)",
};

const overlayPanelStyle = {
    backgroundColor: "var(--sf)",
    border: "1px solid var(--bd)",
    boxShadow: shadows.xl,
    color: "var(--tx)",
};

const overlayTitleStyle = {
    fontSize: px(fontSizes.xxl),
    fontWeight: Number(fontWeights.bold),
    letterSpacing: letterSpacing.snug,
};

export const alimentaTheme = createTheme({
    primaryColor: "alimenta",
    primaryShade: { light: 7, dark: 5 },
    // Filled surfaces pick black or white text by luminance; `black` is the
    // design's ink-on-green, not pure black.
    autoContrast: true,
    luminanceThreshold: 0.4,
    black: schemes.dark.act,
    white: "#ffffff",
    colors: palettes,
    variantColorResolver,
    defaultGradient: { from: "alimenta", to: "sky", deg: 135 },

    fontFamily: fonts.sans,
    fontFamilyMonospace: fonts.mono,
    fontSmoothing: true,
    fontSizes: toRem(fontSizes),
    lineHeights,
    fontWeights,
    headings: {
        fontFamily: fonts.sans,
        fontWeight: fontWeights.bold,
        textWrap: "balance",
        sizes: {
            h1: { fontSize: px(headingSizes.h1), lineHeight: lineHeights.xs },
            h2: { fontSize: px(headingSizes.h2), lineHeight: lineHeights.xs },
            h3: { fontSize: px(headingSizes.h3), lineHeight: "1.25" },
            h4: { fontSize: px(headingSizes.h4), lineHeight: lineHeights.sm },
            h5: { fontSize: px(headingSizes.h5), lineHeight: lineHeights.sm },
            h6: { fontSize: px(headingSizes.h6), lineHeight: "1.4" },
        },
    },

    spacing: toRem(spacing),
    radius: toRem(radius),
    defaultRadius: "md",
    shadows,
    cursorType: "pointer",
    respectReducedMotion: true,

    other: { letterSpacing, motion, controlSizes, shared },

    components: {
        /* ---------------------------------------------------- buttons */
        Button: Button.extend({
            defaultProps: { radius: "pill" },
            vars: (_theme, props) => {
                const size = String(props.size ?? "md");
                const [paddingX, fontSize] =
                    BUTTON_SIZES[size] ?? BUTTON_SIZES.md;
                const height =
                    controlSizes[size as keyof typeof controlSizes] ??
                    controlSizes.md;

                return {
                    root: {
                        "--button-height": px(height),
                        "--button-padding-x": px(paddingX),
                        "--button-fz": px(fontSize),
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
                        fontWeight: Number(fontWeights.semibold),
                        transition: `transform ${motion.fast}, box-shadow ${motion.fast}, background-color ${motion.fast}, color ${motion.fast}`,
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
            defaultProps: {
                radius: "pill",
                variant: "glass",
                size: controlSizes.md,
            },
            styles: (_theme, props) => ({
                root: {
                    backdropFilter:
                        props.variant === "glass" ? "blur(20px)" : undefined,
                    transition: `transform ${motion.fast}, color ${motion.fast}, background-color ${motion.fast}`,
                },
            }),
        }),
        CloseButton: {
            defaultProps: { radius: "pill" },
        },
        ThemeIcon: ThemeIcon.extend({
            // The 34px icon tile, accent-tinted by default; `color="amber"` etc.
            // for meal types, `variant="gradient"` for the brand mark.
            defaultProps: { variant: "light", radius: "sm", size: 34 },
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
                padding: "xl",
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
            defaultProps: { variant: "gradient", radius: "pill" },
            styles: (_theme, props) => ({
                placeholder: {
                    fontWeight: Number(fontWeights.bold),
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
                radius: "xxl",
                padding: 26,
                centered: true,
                overlayProps: { blur: 8, backgroundOpacity: 0.45 },
                transitionProps: { transition: "pop", duration: 240 },
            },
            styles: {
                content: overlayPanelStyle,
                header: { backgroundColor: "transparent" },
                title: overlayTitleStyle,
                close: closeButtonStyle,
            },
        }),
        Drawer: {
            defaultProps: {
                padding: "md",
                overlayProps: { blur: 8, backgroundOpacity: 0.45 },
            },
            styles: {
                content: overlayPanelStyle,
                header: { backgroundColor: "transparent" },
                title: overlayTitleStyle,
                close: closeButtonStyle,
            },
        },
        Menu: {
            defaultProps: { radius: "lg", shadow: "lg" },
            styles: {
                dropdown: {
                    backgroundColor: "var(--sf)",
                    borderColor: "var(--bd2)",
                    padding: px(spacing.xs),
                },
                item: {
                    borderRadius: px(10),
                    fontWeight: Number(fontWeights.medium),
                },
                itemLabel: { color: "var(--tx)" },
                label: {
                    color: "var(--tx3)",
                    fontWeight: Number(fontWeights.semibold),
                },
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
                    padding: px(spacing.xs),
                },
                option: {
                    borderRadius: px(10),
                    fontWeight: Number(fontWeights.medium),
                },
            },
        },
        Tooltip: {
            defaultProps: { radius: "xs" },
            styles: {
                tooltip: {
                    backgroundColor: "var(--tx)",
                    color: "var(--bg)",
                    fontWeight: Number(fontWeights.medium),
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
                        "--input-height": px(height),
                        "--input-padding-inline-start": px(paddingX),
                        "--input-padding-inline-end": px(paddingX),
                        "--input-fz": px(fontSize),
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
                    fontWeight: Number(fontWeights.medium),
                    transition: `border-color ${motion.fast}, box-shadow ${motion.fast}`,
                    animation: props.error ? "alm-shake 400ms ease" : undefined,
                },
            }),
        }),
        InputWrapper: {
            styles: {
                label: {
                    fontSize: px(fontSizes.xs),
                    fontWeight: Number(fontWeights.semibold),
                    color: "var(--tx2)",
                    marginBottom: px(spacing.xs),
                },
                description: {
                    color: "var(--tx3)",
                    fontSize: px(fontSizes.xs),
                },
                error: {
                    fontSize: px(fontSizes.xs),
                    fontWeight: Number(fontWeights.medium),
                    color: "var(--ro)",
                },
            },
        },
        Textarea: {
            defaultProps: { minRows: 4 },
            styles: {
                input: {
                    paddingTop: px(spacing.md),
                    paddingBottom: px(spacing.md),
                    lineHeight: lineHeights.lg,
                },
            },
        },
        Switch: Switch.extend({
            defaultProps: { color: "alimenta" },
            // 46×28 track with a 22px thumb.
            vars: () => ({
                root: {
                    "--switch-width": px(46),
                    "--switch-height": px(28),
                    "--switch-thumb-size": px(22),
                    "--switch-radius": px(radius.pill),
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
            defaultProps: { radius: px(7), color: "alimenta" },
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
            defaultProps: { radius: "pill" },
            styles: {
                root: { backgroundColor: "var(--sf2)", padding: px(3) },
                indicator: {
                    backgroundColor: "var(--sf)",
                    boxShadow: "var(--sh)",
                },
                label: {
                    fontWeight: Number(fontWeights.semibold),
                    fontSize: px(fontSizes.sm),
                },
            },
        },

        /* ------------------------------------------------- navigation */
        Tabs: Tabs.extend({
            // Pill tabs: glass track, raised `--sf` pill for the active tab.
            defaultProps: { variant: "pills", radius: "pill" },
            vars: () => ({
                root: { "--tabs-color": "var(--sf)" },
            }),
            styles: {
                root: cssVars({ "--tabs-text-color": "var(--tx)" }),
                list: {
                    display: "inline-flex",
                    gap: px(2),
                    padding: px(spacing.xxs),
                    borderRadius: radius.pill,
                    backgroundColor: "var(--glass)",
                    border: "1px solid var(--bd)",
                    backdropFilter: "blur(20px)",
                },
                tab: {
                    height: px(38),
                    paddingInline: px(18),
                    fontWeight: Number(fontWeights.semibold),
                    fontSize: px(fontSizes.sm),
                    transition: `background-color ${motion.normal}, color ${motion.normal}`,
                },
            },
        }),
        NavLink: NavLink.extend({
            // Sidebar rows: 40px, raised `--sf` when active.
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
                    height: px(40),
                    paddingInline: px(spacing.md),
                    borderRadius: px(13),
                    color: props.active ? "var(--tx)" : "var(--tx2)",
                    boxShadow: props.active ? "var(--sh)" : "none",
                    transition: `background-color ${motion.normal}, color ${motion.normal}`,
                },
                label: {
                    fontWeight: Number(fontWeights.medium),
                    fontSize: px(fontSizes.md),
                },
                section: { color: props.active ? "var(--ac)" : undefined },
            }),
        }),

        /* ------------------------------------------------- data/feedback */
        Badge: {
            defaultProps: { radius: "pill", variant: "light", tt: "none" },
            styles: {
                root: {
                    fontWeight: Number(fontWeights.bold),
                    letterSpacing: letterSpacing.normal,
                    height: px(26),
                    paddingInline: px(10),
                    fontSize: px(fontSizes.xs),
                },
            },
        },
        Chip: {
            defaultProps: { radius: "pill" },
        },
        Pill: {
            defaultProps: { radius: "pill" },
        },
        Loader: {
            defaultProps: { color: "alimenta", type: "dots" },
        },
        Progress: {
            defaultProps: { radius: "pill", color: "alimenta" },
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
                    boxShadow: shadows.lg,
                    padding: `${px(spacing.md)} ${px(spacing.md)} ${px(spacing.md)} ${px(14)}`,
                    animation: `alm-in 320ms ${motion.spring}`,
                },
                icon: {
                    width: px(30),
                    height: px(30),
                    borderRadius: px(10),
                    marginInlineEnd: px(spacing.md),
                },
                title: {
                    color: "var(--tx)",
                    fontWeight: Number(fontWeights.semibold),
                },
                description: {
                    color: "var(--tx2)",
                    fontSize: px(fontSizes.xs),
                },
                closeButton: {
                    color: "var(--tx3)",
                    borderRadius: px(radius.xs),
                },
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
                th: {
                    color: "var(--tx3)",
                    fontSize: px(fontSizes.xs),
                    fontWeight: Number(fontWeights.semibold),
                },
            },
        },

        /* ------------------------------------------------- typography */
        Title: Title.extend({
            styles: (_theme, props) => ({
                root: {
                    letterSpacing:
                        props.order === 1 || props.order === 2
                            ? letterSpacing.tight
                            : props.order === 3
                              ? letterSpacing.snug
                              : "-0.01em",
                },
            }),
        }),
        Anchor: {
            defaultProps: { underline: "hover" },
        },
    },
});

/**
 * Emits the semantic color variables (`--bg`, `--sf`, `--ac`, …) for each
 * color scheme and points Mantine's own globals (`--mantine-color-body`,
 * `--mantine-primary-color-filled`, …) at them, so every component — ours and
 * Mantine's — follows `tokens.ts`.
 */
export const cssVariablesResolver: CSSVariablesResolver = () => {
    const schemeVars = (scheme: Record<SchemeToken, string>) => ({
        ...Object.fromEntries(
            Object.entries(scheme).map(([key, value]) => [`--${key}`, value])
        ),
        "--mantine-color-body": "var(--bg)",
        "--mantine-color-text": "var(--tx)",
        "--mantine-color-bright": "var(--tx)",
        "--mantine-color-dimmed": "var(--tx3)",
        "--mantine-color-placeholder": "var(--tx3)",
        "--mantine-color-anchor": "var(--ac)",
        "--mantine-color-error": "var(--ro)",
        "--mantine-color-default": "var(--sf)",
        "--mantine-color-default-hover": "var(--sf2)",
        "--mantine-color-default-color": "var(--tx)",
        "--mantine-color-default-border": "var(--bd2)",
        "--mantine-primary-color-filled": "var(--ac)",
        "--mantine-primary-color-filled-hover":
            "color-mix(in srgb, var(--ac) 88%, var(--tx))",
        "--mantine-primary-color-light": "var(--acs)",
        "--mantine-primary-color-light-hover":
            "color-mix(in srgb, var(--acs) 70%, var(--ac))",
        "--mantine-primary-color-light-color": "var(--ac)",
        "--mantine-primary-color-contrast": "var(--act)",
    });

    return {
        variables: {
            "--ink-on-gradient": shared.inkOnGradient,
            "--gradient-accent": shared.gradientAccent,
            // Non-color tokens components need inline: `lts="var(--ls-snug)"`,
            // `transition: \`background var(--motion-fast)\``.
            "--ls-tight": letterSpacing.tight,
            "--ls-snug": letterSpacing.snug,
            "--ls-wide": letterSpacing.wide,
            "--motion-fast": motion.fast,
            "--motion-normal": motion.normal,
            "--motion-slow": motion.slow,
            "--motion-spring": motion.spring,
        },
        light: schemeVars(schemes.light),
        dark: schemeVars(schemes.dark),
    };
};
