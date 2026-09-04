import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/mantine/ui";
import { Group } from "@mantine/core";

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
    return (
        <AlertDialog open={open} onOpenChangeAction={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Delete {count} meal{count !== 1 ? "s" : ""}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        You are about to permanently delete{" "}
                        <strong>
                            {count} meal{count !== 1 ? "s" : ""}
                        </strong>
                        . This action cannot be undone and the deleted meal
                        {count !== 1 ? "s" : ""} cannot be retrieved. It may
                        also affect your nutrition statistics and reports.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className={"justify-between mt-4"}>
                    <Group gap="xs" className="w-full">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={onConfirm}
                        >
                            Delete{" "}
                            <em>
                                {count} meal{count !== 1 ? "s" : ""}
                            </em>
                        </AlertDialogAction>
                    </Group>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
