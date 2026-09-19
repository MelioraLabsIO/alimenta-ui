"use client";

import { PartyPopper } from "lucide-react";
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/mantine/ui";

interface SpinWinnerDialogProps {
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
    /** Winning participant's display name. */
    displayName: string;
    /** The food the group is eating. */
    foodName: string;
}

/**
 * Celebratory, screen-centered announcement shown to every participant once
 * the wheel lands on the backend-chosen winner. Driven by the
 * `spin.completed` realtime event, so hosts and guests see it in sync.
 */
export function SpinWinnerDialog({
    open,
    onOpenChangeAction,
    displayName,
    foodName,
}: SpinWinnerDialogProps) {
    return (
        <Dialog open={open} onOpenChangeAction={onOpenChangeAction}>
            <DialogContent className="sm:max-w-md">
                <div className="flex flex-col items-center gap-4 py-2 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <PartyPopper className="h-8 w-8" aria-hidden="true" />
                    </div>

                    <DialogHeader className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            The wheel has spoken
                        </p>
                        <DialogTitle className="text-2xl font-bold text-foreground">
                            {foodName || "—"}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            {displayName
                                ? `${displayName}'s pick won the spin — that's what we're eating!`
                                : "That's what we're eating!"}
                        </DialogDescription>
                    </DialogHeader>

                    <Button
                        className="mt-2 min-w-[120px]"
                        onClick={() => onOpenChangeAction(false)}
                    >
                        Sounds good
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
