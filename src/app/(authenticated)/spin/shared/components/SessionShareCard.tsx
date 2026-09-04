"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { Check, Copy, Crown, Share2 } from "lucide-react";
import { routes } from "@/lib/routes";
import {
    Badge,
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/mantine/ui";
import { Stack } from "@mantine/core";

interface SessionShareCardProps {
    /** The session's ID — the only thing needed to join, and the `/spin/[session_id]` slug of the join link. */
    sessionId: string;
    joinUrl?: string;
    isHost: boolean;
}

/**
 * Displays the QR share dialog trigger and a host indicator badge. Lives in
 * the left column of the Shared layout.
 */
export function SessionShareCard({
    sessionId,
    joinUrl,
    isHost,
}: SessionShareCardProps) {
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const joinPath = routes.spinSession(sessionId);
    const resolvedJoinUrl =
        joinUrl && joinUrl.trim().length > 0
            ? joinUrl
            : typeof window !== "undefined"
              ? `${window.location.origin}${joinPath}`
              : joinPath.slice(1);

    async function handleCopyJoinLink() {
        try {
            await navigator.clipboard.writeText(resolvedJoinUrl);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        } catch {
            setCopiedLink(false);
        }
    }

    return (
        <div className="w-full space-y-3">
            <div className="flex items-center justify-between gap-2">
                <Dialog
                    open={shareDialogOpen}
                    onOpenChangeAction={setShareDialogOpen}
                >
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            aria-label="Share session QR code"
                        >
                            <Share2 className="h-3.5 w-3.5" />
                            Share
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>
                                <em>Share</em> this session
                            </DialogTitle>
                            <DialogDescription>
                                Ask others to scan this QR code, or send them
                                the join link below.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center gap-3 py-1">
                            <div
                                className="rounded-lg bg-white p-3 mt-4"
                                aria-label="QR code to join this session"
                            >
                                <QRCode value={resolvedJoinUrl} size={192} />
                            </div>
                            <p className="text-xs text-muted-foreground break-all text-center">
                                {resolvedJoinUrl}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={handleCopyJoinLink}
                                aria-label={
                                    copiedLink
                                        ? "Join link copied"
                                        : "Copy join link"
                                }
                            >
                                {copiedLink ? (
                                    <Check className="h-3.5 w-3.5 text-primary" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                )}
                                {copiedLink ? "Copied link" : "Copy join link"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {isHost && (
                    <Badge
                        variant="outline"
                        className="border-yellow-500/40 text-yellow-400 bg-yellow-500/10 gap-1.5 text-xs"
                    >
                        <Stack
                            gap={5}
                            align="center"
                            style={{ flexDirection: "row" }}
                        >
                            <Crown className="h-3 w-3" aria-hidden="true" />
                            You are the host
                        </Stack>
                    </Badge>
                )}
            </div>

            <p className="text-xs text-muted-foreground">
                Use Share to show the join QR code.
            </p>
        </div>
    );
}
