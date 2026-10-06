"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
    Box,
    Button,
    Paper,
    Stack,
    Text,
    ThemeIcon,
    Tooltip,
} from "@mantine/core";
import { Dices } from "lucide-react";

/** Segment palette, in slice order. Exported so the segment list can show
 *  a matching swatch beside each entry. */
export const WHEEL_COLORS = [
    "#3bd692",
    "#60a5fa",
    "#fbbf24",
    "#f472b6",
    "#a78bfa",
    "#2dd4bf",
    "#fb923c",
    "#38bdf8",
    "#e879f9",
    "#4ade80",
];

/** Length of the wheel's landing animation. Exported so callers can time
 *  follow-up UI (e.g. a winner dialog) to when the wheel comes to rest. */
export const SPIN_DURATION_MS = 3500;
const SPIN_ROTATIONS = 6;
const MAX_LABEL_LENGTH = 14;
const WHEEL_SIZE = 320;
const WHEEL_CENTER = WHEEL_SIZE / 2;
const WHEEL_RADIUS = 156;

export type WheelSegment = {
    /** Display label rendered on the wheel slice. */
    label: string;
    /** Optional stable ID used by the caller to correlate segments. */
    id?: string;
};

/**
 * Used by the shared mode to deliver a backend-chosen winner without
 * relying on Math.random() in the frontend.
 * Increment `seq` each time a new spin result arrives so that the wheel
 * re-animates even when the same segment wins twice in a row.
 */
export type SpinTrigger = {
    seq: number;
    winnerIndex: number;
};

interface MealPickerWheelProps {
    segments: WheelSegment[];
    onResult?: (label: string, index: number) => void;
    /**
     * When provided, clicking Spin calls this instead of picking a random winner.
     * The parent is responsible for supplying `spinTrigger` with the backend result.
     */
    onSpinRequest?: () => void;
    /**
     * When `seq` changes the wheel animates to `winnerIndex`.
     * Only used together with `onSpinRequest`.
     */
    spinTrigger?: SpinTrigger | null;
    /**
     * Overrides the built-in disabled logic for the Spin button.
     * Useful when only the host should be able to spin in shared sessions.
     */
    canSpin?: boolean;
    /**
     * Tooltip shown on the Spin button when it is disabled due to an
     * external constraint (e.g. "Only the host can spin").
     */
    spinDisabledReason?: string;
    /**
     * Hide the Spin button altogether — the guest room shows a "waiting for
     * the host" status pill in its place, since a guest can never spin.
     */
    showSpinButton?: boolean;
    /** Dims the wheel slightly (the guest room's read-only wheel). */
    muted?: boolean;
}

function describeSegmentPath(
    cx: number,
    cy: number,
    r: number,
    startAngleDeg: number,
    endAngleDeg: number
): string {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngleDeg));
    const y1 = cy + r * Math.sin(toRad(startAngleDeg));
    const x2 = cx + r * Math.cos(toRad(endAngleDeg));
    const y2 = cy + r * Math.sin(toRad(endAngleDeg));
    const largeArc = endAngleDeg - startAngleDeg > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

function truncateLabel(label: string): string {
    return label.length > MAX_LABEL_LENGTH
        ? label.slice(0, MAX_LABEL_LENGTH - 1) + "…"
        : label;
}

/**
 * The 28px wheel panel every spin screen uses: accent halo behind, content
 * centered. Pages drop the wheel (or its empty state) and any captions in.
 */
export function WheelCard({ children }: { children: ReactNode }) {
    return (
        <Paper
            radius={28}
            p={28}
            pos="relative"
            style={{ overflow: "hidden", border: "1px solid var(--bd)" }}
        >
            <Box
                pos="absolute"
                w={440}
                h={440}
                style={{
                    top: 30,
                    left: "50%",
                    marginLeft: -220,
                    borderRadius: 999,
                    background:
                        "radial-gradient(circle, var(--acs), transparent 65%)",
                    pointerEvents: "none",
                }}
            />
            <Stack align="center" gap={22} pos="relative">
                {children}
            </Stack>
        </Paper>
    );
}

/** The dashed-circle placeholder shown inside `WheelCard` before there are
 *  any segments. */
export function WheelEmptyState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <Stack align="center" justify="center" gap={12} h={340}>
            <Box
                w={220}
                h={220}
                display="flex"
                style={{
                    borderRadius: 999,
                    border: "2px dashed var(--bd2)",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <ThemeIcon
                    size={64}
                    radius={20}
                    variant="surface"
                    style={{
                        backgroundColor: "var(--sf2)",
                        color: "var(--tx3)",
                    }}
                >
                    <Dices size={30} />
                </ThemeIcon>
            </Box>
            <Text fw={700} fz={17} mt={6}>
                {title}
            </Text>
            <Text fz={13} c="var(--tx3)" ta="center">
                {description}
            </Text>
        </Stack>
    );
}

export function MealSpinWheel({
    segments,
    onResult,
    onSpinRequest,
    spinTrigger,
    canSpin,
    spinDisabledReason,
    showSpinButton = true,
    muted = false,
}: MealPickerWheelProps) {
    const [cumulativeRotation, setCumulativeRotation] = useState(0);
    const cumulativeRotationRef = useRef(0);
    const [spinning, setSpinning] = useState(false);
    const [winner, setWinner] = useState<{
        label: string;
        index: number;
    } | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const segmentsRef = useRef(segments);
    const prevSpinSeqRef = useRef<number>(-1);

    // Keep segmentsRef in sync so setTimeout closures see fresh data.
    useEffect(() => {
        segmentsRef.current = segments;
    }, [segments]);

    // Clear any pending timer on unmount to prevent state updates after unmount.
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const n = segments.length;
    const cx = WHEEL_CENTER;
    const cy = WHEEL_CENTER;
    const r = WHEEL_RADIUS;

    /** Core animation that rotates the wheel so `winnerIndex` lands at the pointer. */
    function triggerAnimation(winnerIndex: number) {
        const rotation = cumulativeRotationRef.current;
        const segAngle = 360 / n;
        const winnerCenter = (winnerIndex + 0.5) * segAngle;
        const basicTarget = (360 - winnerCenter) % 360;
        const currentMod = rotation % 360;
        let delta = basicTarget - currentMod;
        if (delta <= 0) delta += 360;
        delta += SPIN_ROTATIONS * 360;
        const newRotation = rotation + delta;

        cumulativeRotationRef.current = newRotation;
        setCumulativeRotation(newRotation);
        setSpinning(true);
        setWinner(null);

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setSpinning(false);
            const seg = segmentsRef.current[winnerIndex];
            if (seg) {
                setWinner({ label: seg.label, index: winnerIndex });
                onResult?.(seg.label, winnerIndex);
            }
        }, SPIN_DURATION_MS);
    }

    /** Fires when the parent delivers a backend winner via `spinTrigger`. */
    useEffect(() => {
        if (!spinTrigger) return;
        if (spinTrigger.seq === prevSpinSeqRef.current) return;
        if (n === 0) return;
        prevSpinSeqRef.current = spinTrigger.seq;
        triggerAnimation(spinTrigger.winnerIndex);
        // triggerAnimation is stable (no changing deps captured via refs).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [spinTrigger?.seq, n]);

    function handleSpin() {
        if (spinning || n === 0) return;
        if (onSpinRequest) {
            // Delegate to the parent; animation fires when spinTrigger updates.
            onSpinRequest();
            return;
        }
        // Personal mode: pick a winner locally.
        triggerAnimation(Math.floor(Math.random() * n));
    }

    // Resolve disabled state for the Spin button.
    const externallyDisabled = canSpin === false;
    const notEnoughSegments = n <= 1;
    const buttonDisabled = spinning || notEnoughSegments || externallyDisabled;

    const tooltipLabel =
        externallyDisabled && spinDisabledReason
            ? spinDisabledReason
            : notEnoughSegments
              ? "Add more meals to spin!"
              : "";

    if (n === 0) {
        return (
            <Text fz={13} c="var(--tx3)" py={32} ta="center">
                No meals available to spin.
            </Text>
        );
    }

    const segAngle = 360 / n;

    return (
        <>
            {/* Pointer + ring + wheel */}
            <Box pos="relative" pt={8} w="100%" maw={340}>
                <Box
                    pos="absolute"
                    top={0}
                    left="50%"
                    w={0}
                    h={0}
                    aria-hidden="true"
                    style={{
                        zIndex: 3,
                        transform: "translateX(-50%)",
                        borderLeft: "14px solid transparent",
                        borderRight: "14px solid transparent",
                        borderTop: "24px solid var(--tx)",
                        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                    }}
                />
                <Box
                    p={10}
                    bg="var(--sf2)"
                    opacity={muted ? 0.85 : 1}
                    style={{
                        borderRadius: 999,
                        boxShadow:
                            "0 20px 50px rgba(0,0,0,0.25), inset 0 0 0 1px var(--bd)",
                    }}
                >
                    <svg
                        viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
                        style={{
                            display: "block",
                            width: "100%",
                            height: "auto",
                            transform: `rotate(${cumulativeRotation}deg)`,
                            transition: spinning
                                ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
                                : "none",
                        }}
                        aria-label="Meal picker spin wheel"
                    >
                        {n === 1 ? (
                            <circle
                                cx={cx}
                                cy={cy}
                                r={r}
                                fill={WHEEL_COLORS[0]}
                            />
                        ) : (
                            segments.map((seg, i) => {
                                const startAngle = i * segAngle - 90;
                                const endAngle = (i + 1) * segAngle - 90;
                                const color =
                                    WHEEL_COLORS[i % WHEEL_COLORS.length];
                                return (
                                    <path
                                        key={seg.id ?? i}
                                        d={describeSegmentPath(
                                            cx,
                                            cy,
                                            r,
                                            startAngle,
                                            endAngle
                                        )}
                                        fill={color}
                                        stroke="rgba(0,0,0,0.12)"
                                        strokeWidth="1"
                                    />
                                );
                            })
                        )}

                        {/* Segment labels */}
                        {segments.map((seg, i) => {
                            const midAngleDeg = (i + 0.5) * segAngle - 90;
                            const midAngleRad = (midAngleDeg * Math.PI) / 180;
                            const textR = n === 1 ? 0 : r * 0.6;
                            const tx = cx + textR * Math.cos(midAngleRad);
                            const ty = cy + textR * Math.sin(midAngleRad);
                            const normalizedMid =
                                ((midAngleDeg % 360) + 360) % 360;
                            const needsFlip =
                                normalizedMid > 90 && normalizedMid <= 270;
                            const labelAngle = needsFlip
                                ? midAngleDeg + 180
                                : midAngleDeg;
                            const displayLabel = truncateLabel(seg.label);
                            return (
                                <text
                                    key={seg.id ?? i}
                                    x={tx}
                                    y={ty}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    transform={`rotate(${labelAngle}, ${tx}, ${ty})`}
                                    style={{
                                        fontSize: n > 6 ? 11 : 13,
                                        fontWeight: 700,
                                        fill: "#04110a",
                                        fontFamily:
                                            "var(--font-geist-sans), Geist, sans-serif",
                                        pointerEvents: "none",
                                    }}
                                >
                                    {displayLabel}
                                </text>
                            );
                        })}

                        {/* Center hub */}
                        <circle
                            cx={cx}
                            cy={cy}
                            r={26}
                            fill="var(--sf)"
                            stroke="rgba(0,0,0,0.12)"
                            strokeWidth="1"
                        />
                        <circle cx={cx} cy={cy} r={9} fill="var(--ac)" />
                    </svg>
                </Box>
            </Box>

            {/* Result reveal */}
            <Box mih={58} ta="center">
                {winner && (
                    <Box
                        style={{
                            animation:
                                "alm-in 500ms cubic-bezier(.2,.8,.2,1) both",
                        }}
                    >
                        <Text
                            fz={12}
                            fw={600}
                            c="var(--ac)"
                            tt="uppercase"
                            lts="0.04em"
                        >
                            Tonight you&apos;re having
                        </Text>
                        <Text fz={28} fw={700} lts="-0.03em" mt={2}>
                            {winner.label}
                        </Text>
                    </Box>
                )}
            </Box>

            {/* Spin button */}
            {showSpinButton && (
                <Tooltip label={tooltipLabel} disabled={!tooltipLabel}>
                    <Button
                        onClick={handleSpin}
                        disabled={buttonDisabled}
                        variant="gradient"
                        size="xl"
                        miw={200}
                        fw={700}
                        leftSection={<Dices size={19} />}
                        aria-label={
                            externallyDisabled
                                ? (spinDisabledReason ?? "Spin disabled")
                                : spinning
                                  ? "Spinning…"
                                  : "Spin the wheel"
                        }
                        aria-disabled={buttonDisabled}
                    >
                        {spinning ? "Spinning…" : "Spin!"}
                    </Button>
                </Tooltip>
            )}
        </>
    );
}
