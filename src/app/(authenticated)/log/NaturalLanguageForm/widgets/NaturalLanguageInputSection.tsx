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
                borderRadius: 24,
                background: "var(--gradient-accent)",
                boxShadow: "var(--sh)",
            }}
        >
            <Paper radius={22.5} p={22} shadow="none" withBorder={false}>
                <Stack gap={14}>
                    <Group gap={10} wrap="nowrap">
                        <ThemeIcon>
                            <Sparkles size={16} />
                        </ThemeIcon>
                        <Box miw={0}>
                            <Text fw={700} fz={16}>
                                Just tell us what you ate
                            </Text>
                            <Text fz={12} c="var(--tx3)">
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
                                fontSize: 17,
                                lineHeight: 1.5,
                                borderRadius: 16,
                                padding: 16,
                            },
                        }}
                    />

                    <Group gap={8} wrap="wrap">
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
