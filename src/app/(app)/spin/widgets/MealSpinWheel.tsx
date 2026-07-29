"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/mantine/ui";
import { Dices } from "lucide-react";
import { Tooltip } from "@mantine/core";

const WHEEL_COLORS = [
    "#58d1a0",
    "#60a5fa",
    "#fbbf24",
    "#f472b6",
    "#a78bfa",
    "#34d399",
    "#fb923c",
    "#38bdf8",
    "#e879f9",
    "#4ade80",
];

const SPIN_DURATION_MS = 3500;
const SPIN_ROTATIONS = 6;
const MAX_LABEL_LENGTH = 10;
const PRIMARY_COLOR = "#58d1a0";
const WHEEL_CENTER_X = 150;
const WHEEL_CENTER_Y = 150;
const WHEEL_RADIUS = 140;
const POINTER_WIDTH = 20;
const POINTER_HEIGHT = 24;

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
        ? label.slice(0, MAX_LABEL_LENGTH) + "…"
        : label;
}

export function MealSpinWheel({
    segments,
    onResult,
    onSpinRequest,
    spinTrigger,
    canSpin,
    spinDisabledReason,
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
    const cx = WHEEL_CENTER_X;
    const cy = WHEEL_CENTER_Y;
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
            <div className="flex flex-col items-center gap-4 py-8">
                <p className="text-sm text-muted-foreground">
                    No meals available to spin.
                </p>
            </div>
        );
    }

    const segAngle = 360 / n;

    return (
        <div className="flex flex-col items-center gap-5">
            {/* Wheel + pointer */}
            <div className="relative inline-block">
                {/* Pointer arrow pointing down into wheel */}
                <div
                    className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-[6px]"
                    aria-hidden="true"
                >
                    <svg
                        width={POINTER_WIDTH}
                        height={POINTER_HEIGHT}
                        viewBox={`0 0 ${POINTER_WIDTH} ${POINTER_HEIGHT}`}
                    >
                        <polygon
                            points={`${POINTER_WIDTH / 2},${POINTER_HEIGHT - 2} 0,2 ${POINTER_WIDTH},2`}
                            fill={PRIMARY_COLOR}
                            stroke="white"
                            strokeWidth="1.5"
                        />
                    </svg>
                </div>

                {/* Spinning wheel SVG */}
                <svg
                    width="300"
                    height="300"
                    viewBox="0 0 300 300"
                    style={{
                        transform: `rotate(${cumulativeRotation}deg)`,
                        transition: spinning
                            ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
                            : "none",
                    }}
                    aria-label="Meal picker spin wheel"
                >
                    {n === 1 ? (
                        <circle cx={cx} cy={cy} r={r} fill={WHEEL_COLORS[0]} />
                    ) : (
                        segments.map((seg, i) => {
                            const startAngle = i * segAngle - 90;
                            const endAngle = (i + 1) * segAngle - 90;
                            const color = WHEEL_COLORS[i % WHEEL_COLORS.length];
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
                                    stroke="rgba(0,0,0,0.15)"
                                    strokeWidth="1.5"
                                />
                            );
                        })
                    )}

                    {/* Segment labels */}
                    {segments.map((seg, i) => {
                        const midAngleDeg = (i + 0.5) * segAngle - 90;
                        const midAngleRad = (midAngleDeg * Math.PI) / 180;
                        const textR = n === 1 ? 0 : r * 0.62;
                        const tx = cx + textR * Math.cos(midAngleRad);
                        const ty = cy + textR * Math.sin(midAngleRad);
                        const normalizedMid = ((midAngleDeg % 360) + 360) % 360;
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
                                    fontSize: n > 6 ? "8px" : "10px",
                                    fontWeight: 600,
                                    fill: "white",
                                    pointerEvents: "none",
                                    paintOrder: "stroke",
                                    stroke: "rgba(0,0,0,0.3)",
                                    strokeWidth: "3px",
                                }}
                            >
                                {displayLabel}
                            </text>
                        );
                    })}

                    {/* Center hub */}
                    {n > 1 && (
                        <>
                            <circle
                                cx={cx}
                                cy={cy}
                                r={18}
                                fill="var(--background)"
                                stroke="rgba(255,255,255,0.3)"
                                strokeWidth="2"
                            />
                            <circle
                                cx={cx}
                                cy={cy}
                                r={8}
                                fill={PRIMARY_COLOR}
                            />
                        </>
                    )}
                </svg>
            </div>

            {/* Result display */}
            <div className="min-h-[48px] text-center">
                {winner && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <p className="text-xs text-muted-foreground mb-0.5">
                            Today&apos;s pick 🎉
                        </p>
                        <p className="text-xl font-bold text-foreground">
                            {winner.label}
                        </p>
                    </div>
                )}
            </div>

            {/* Spin button */}
            <Tooltip
                label={tooltipLabel}
                disabled={!tooltipLabel}
            >
                <Button
                    onClick={handleSpin}
                    disabled={buttonDisabled}
                    className="gap-2 min-w-[120px]"
                    aria-label={
                        externallyDisabled
                            ? (spinDisabledReason ?? "Spin disabled")
                            : spinning
                              ? "Spinning…"
                              : "Spin the wheel"
                    }
                    aria-disabled={buttonDisabled}
                >
                    <Dices className="h-4 w-4" />
                    {spinning ? "Spinning…" : "Spin!"}
                </Button>
            </Tooltip>
        </div>
    );
}
