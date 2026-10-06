import { Paper, Stack, Text } from "@mantine/core";

type ExtractedMealTextListProps = {
    title: string;
    items: string[];
    /** `neutral` = hairline-bordered box, `amber` = tinted "Quick question" box. */
    tone?: "neutral" | "amber";
};

export function ExtractedMealTextList({
    title,
    items,
    tone = "neutral",
}: ExtractedMealTextListProps) {
    if (items.length === 0) {
        return null;
    }

    const isAmber = tone === "amber";

    return (
        <Paper
            radius={16}
            px={14}
            py={12}
            shadow="none"
            withBorder={false}
            bg={
                isAmber
                    ? "color-mix(in srgb, var(--am) 10%, transparent)"
                    : "transparent"
            }
            style={{ border: isAmber ? "none" : "1px solid var(--bd)" }}
        >
            <Text
                fz={12}
                fw={600}
                c={isAmber ? "var(--am)" : "var(--tx2)"}
                mb={6}
            >
                {title}
            </Text>
            <Stack gap={4}>
                {items.map((item) => (
                    <Text key={item} fz={13} lh={1.5}>
                        {item}
                    </Text>
                ))}
            </Stack>
        </Paper>
    );
}
