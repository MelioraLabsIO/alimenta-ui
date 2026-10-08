import { Sparkles, WandSparkles } from "lucide-react";
import {
    Box,
    Button,
    Group,
    Paper,
    Stack,
    Text,
    Textarea,
    ThemeIcon,
} from "@mantine/core";

type NaturalLanguageInputSectionProps = {
    text: string;
    error: string;
    isExtracting: boolean;
    onAnalyze: () => void;
    onTextChange: (value: string) => void;
};

/** Example descriptions the chips drop into the textarea. */
const EXAMPLES: { label: string; text: string }[] = [
    {
        label: "Oatmeal + banana",
        text: "Big bowl of oatmeal with banana and almond milk, plus a black coffee",
    },
    {
        label: "Chicken salad",
        text: "Grilled chicken salad with cherry tomatoes and olive oil",
    },
];

export function NaturalLanguageInputSection({
    text,
    error,
    isExtracting,
    onAnalyze,
    onTextChange,
}: NaturalLanguageInputSectionProps) {
    return (
        <Box
            p={1.5}
            style={{
                borderRadius: "var(--mantine-radius-xl)",
                background: "var(--gradient-accent)",
                boxShadow: "var(--sh)",
            }}
        >
            <Paper
                style={{
                    borderRadius: "calc(var(--mantine-radius-xl) - 1.5px)",
                }}
                p="xl"
                shadow="none"
                withBorder={false}
            >
                <Stack gap="md">
                    <Group gap="sm" wrap="nowrap">
                        <ThemeIcon>
                            <Sparkles size={16} />
                        </ThemeIcon>
                        <Box miw={0}>
                            <Text fw={700} fz="lg">
                                Just tell us what you ate
                            </Text>
                            <Text fz="xs" c="var(--tx3)">
                                We&apos;ll pull out the foods and amounts.
                            </Text>
                        </Box>
                    </Group>

                    <Textarea
                        id="nl-input"
                        placeholder="e.g. I had a big bowl of oatmeal with banana and almond milk for breakfast, plus a black coffee"
                        value={text}
                        disabled={isExtracting}
                        onChange={(e) => onTextChange(e.target.value)}
                        minRows={4}
                        autosize
                        error={error || undefined}
                        styles={{
                            input: {
                                fontSize: "var(--mantine-font-size-xl)",
                                lineHeight: "var(--mantine-line-height-lg)",
                                borderRadius: "var(--mantine-radius-lg)",
                                padding: "var(--mantine-spacing-lg)",
                            },
                        }}
                    />

                    <Group gap="sm" wrap="wrap">
                        <Button
                            type="button"
                            onClick={onAnalyze}
                            loading={isExtracting}
                            leftSection={<WandSparkles size={16} />}
                        >
                            Extract meal
                        </Button>
                        {EXAMPLES.map((example) => (
                            <Button
                                key={example.label}
                                type="button"
                                variant="default"
                                size="xs"
                                h={32}
                                fw={500}
                                c="var(--tx2)"
                                disabled={isExtracting}
                                onClick={() => onTextChange(example.text)}
                            >
                                {example.label}
                            </Button>
                        ))}
                    </Group>
                </Stack>
            </Paper>
        </Box>
    );
}
