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
            radius="lg"
            px="md"
            py="md"
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
                fz="xs"
                fw={600}
                c={isAmber ? "var(--am)" : "var(--tx2)"}
                mb="xs"
            >
                {title}
            </Text>
            <Stack gap="xxs">
                {items.map((item) => (
                    <Text key={item} fz="sm" lh="lg">
                        {item}
                    </Text>
                ))}
            </Stack>
        </Paper>
    );
}
