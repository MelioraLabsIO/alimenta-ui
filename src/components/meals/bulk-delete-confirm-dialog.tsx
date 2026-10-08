import { Button, Group, Modal, Stack, Text, ThemeIcon } from "@mantine/core";
import { Trash2 } from "lucide-react";

interface BulkDeleteConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    count: number;
    onConfirm: () => void;
}

export function BulkDeleteConfirmDialog({
    open,
    onOpenChange,
    count,
    onConfirm,
}: BulkDeleteConfirmDialogProps) {
    const noun = `${count} meal${count !== 1 ? "s" : ""}`;

    return (
        <Modal
            opened={open}
            onClose={() => onOpenChange(false)}
            size={420}
            title={`Delete ${noun}?`}
        >
            <Stack gap="lg">
                <Group gap="md" wrap="nowrap" align="flex-start">
                    <ThemeIcon color="rose" size={44} radius="md">
                        <Trash2 size={18} />
                    </ThemeIcon>
                    <Text fz="md" c="var(--tx2)" lh="lg">
                        You are about to permanently delete{" "}
                        <Text component="span" fw={700} c="var(--tx)">
                            {noun}
                        </Text>
                        . This cannot be undone and the deleted meal
                        {count !== 1 ? "s" : ""} cannot be retrieved. It may
                        also affect your nutrition statistics and reports.
                    </Text>
                </Group>

                <Group gap="sm" justify="flex-end">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="rose"
                        size="sm"
                        leftSection={<Trash2 size={14} />}
                        onClick={onConfirm}
                    >
                        Delete {noun}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
