import { Button, Group } from "@mantine/core";
import { ArrowLeft } from "lucide-react";

type BackToPreviewButtonProps = {
    onBack: () => void;
};

export function BackToPreviewButton({ onBack }: BackToPreviewButtonProps) {
    return (
        <Group gap={8}>
            <Button
                type="button"
                variant="subtle"
                size="xs"
                onClick={onBack}
                leftSection={<ArrowLeft size={14} />}
            >
                Back to preview
            </Button>
        </Group>
    );
}
