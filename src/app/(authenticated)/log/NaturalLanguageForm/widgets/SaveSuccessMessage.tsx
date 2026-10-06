import { Group, Text, ThemeIcon } from "@mantine/core";
import { CircleCheck } from "lucide-react";

export function SaveSuccessMessage() {
    return (
        <Group
            gap={8}
            wrap="nowrap"
            style={{ animation: "alm-in 400ms cubic-bezier(.2,.8,.2,1) both" }}
        >
            <ThemeIcon size={26} radius={8}>
                <CircleCheck size={15} />
            </ThemeIcon>
            <Text fz={13} fw={600} c="var(--ac)">
                Meal saved successfully!
            </Text>
        </Group>
    );
}
