"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import QRCode from "react-qr-code";
import { Check, Copy, Crown, Share2 } from "lucide-react";
import { createSpinSession } from "@/apis/spin/mutations";
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

interface SessionShareCardProps {
    code: string;
    isHost: boolean;
}

/**
 * Displays the session code, a copy button, a QR share dialog trigger, and a
 * host indicator badge. Lives in the left column of the Shared layout.
 */
export function SessionShareCard({ code, isHost }: SessionShareCardProps) {
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const {
        mutate: createSpinSessionMutation,
        isPending: isCreatingSpinSession,
        data: createdSession,
    } = useMutation({
        mutationKey: ["createSpinSession"],
        mutationFn: createSpinSession,
    });

    const joinUrl = createdSession?.joinURL;

    async function handleCopyCode() {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        } catch {
            // Fallback for browsers that don't support clipboard API
            setCopiedCode(false);
        }
    }

    async function handleCopyJoinLink() {
        try {
            await navigator.clipboard.writeText(joinUrl!);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        } catch {
            // Fallback for browsers that don't support clipboard API
            setCopiedLink(false);
        }
    }

    function handleOpenChange(nextOpen: boolean) {
        setShareDialogOpen(nextOpen);

        if (nextOpen) {
            createSpinSessionMutation();
        }
    }

    return (
        <div className="w-full space-y-3">
            <div className="flex items-center justify-between gap-2">
                <Dialog open={shareDialogOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            aria-label="Share session QR code"
                            disabled={isCreatingSpinSession}
                        >
                            <Share2 className="h-3.5 w-3.5" />
                            Share
                        </Button>
                    </DialogTrigger>
                    {isCreatingSpinSession && <p>Creating session...</p>}
                    {!isCreatingSpinSession && (
                        <DialogContent className="sm:max-w-sm">
                            <DialogHeader>
                                <DialogTitle>
                                    <em>Share</em> this session
                                </DialogTitle>
                                <DialogDescription>
                                    Ask others to scan this QR code to join
                                    using code {code}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col items-center gap-3 py-1">
                                <div
                                    className="rounded-lg bg-white p-3 mt-4"
                                    aria-label={`QR code to join session ${code}`}
                                >
                                    <QRCode value={joinUrl!} size={192} />
                                </div>
                                <p className="text-xs text-muted-foreground break-all text-center">
                                    {joinUrl}
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
                                    {copiedLink
                                        ? "Copied link"
                                        : "Copy join link"}
                                </Button>
                            </div>
                        </DialogContent>
                    )}
                </Dialog>

                {isHost && (
                    <Badge
                        variant="outline"
                        className="border-yellow-500/40 text-yellow-400 bg-yellow-500/10 gap-1.5 text-xs"
                    >
                        <Crown className="h-3 w-3" aria-hidden="true" />
                        You are the host
                    </Badge>
                )}
            </div>

            <div className="min-w-0 space-y-2">
                <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                        Session code
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold font-mono tracking-wider">
                            {code}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={handleCopyCode}
                            aria-label={
                                copiedCode
                                    ? "Code copied!"
                                    : `Copy session code ${code}`
                            }
                        >
                            {copiedCode ? (
                                <Check className="h-4 w-4 text-primary" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">
                    Use Share to show the join QR code.
                </p>
            </div>
        </div>
    );
}
