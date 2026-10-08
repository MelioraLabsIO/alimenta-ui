import { Group, Text, ThemeIcon } from "@mantine/core";
import { CircleCheck } from "lucide-react";

export function SaveSuccessMessage() {
    return (
        <Group
            gap="sm"
            wrap="nowrap"
            style={{ animation: "alm-in 400ms var(--motion-spring) both" }}
        >
            <ThemeIcon size={26} radius="xs">
                <CircleCheck size={15} />
            </ThemeIcon>
            <Text fz="sm" fw={600} c="var(--ac)">
                Meal saved successfully!
            </Text>
        </Group>
    );
}
