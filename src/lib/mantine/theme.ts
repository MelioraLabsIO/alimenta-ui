import { createTheme, rem } from "@mantine/core";

export const alimentaTheme = createTheme({
    primaryColor: "alimenta",
    primaryShade: { light: 6, dark: 5 },
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    fontFamilyMonospace: "var(--font-geist-mono), ui-monospace, monospace",
    defaultRadius: "md",
    colors: {
        alimenta: [
            "#effdf6",
            "#dff9ec",
            "#bdf1d8",
            "#8be4bd",
            "#58d1a0",
            "#31bd86",
            "#22a876",
            "#18865f",
            "#146b4f",
            "#115843",
        ],
        berry: [
            "#fff0f5",
            "#ffe0eb",
            "#ffc0d6",
            "#ff91b5",
            "#f45f94",
            "#dc3f7c",
            "#c62f6c",
            "#a22659",
            "#84214b",
            "#6d1f41",
        ],
        dark: [
            "#f2f7f4",
            "#cbd8d0",
            "#9fb0a7",
            "#71837a",
            "#4d5f55",
            "#26332c",
            "#101811",
            "#040706",
            "#030504",
            "#010201",
        ],
    },

    headings: {
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        fontWeight: "700",
        sizes: {
            h1: { fontSize: rem(28), lineHeight: "1.15" },
            h2: { fontSize: rem(22), lineHeight: "1.2" },
            h3: { fontSize: rem(18), lineHeight: "1.25" },
        },
    },
    components: {
        Button: {
            defaultProps: {
                radius: "md",
            },
        },
        Card: {
            defaultProps: {
                radius: "md",
                withBorder: true,
            },
        },
        Modal: {
            defaultProps: {
                radius: "md",
                overlayProps: { blur: 4 },
            },
        },
        Drawer: {
            defaultProps: {
                overlayProps: { blur: 4 },
            },
        },
        TextInput: {
            defaultProps: {
                radius: "md",
            },
        },
        Textarea: {
            defaultProps: {
                radius: "md",
            },
        },
        Select: {
            defaultProps: {
                radius: "md",
            },
        },
    },
});
