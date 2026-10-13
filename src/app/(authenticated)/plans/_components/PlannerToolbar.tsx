"use client";

import {
    ActionIcon,
    Box,
    Button,
    Group,
    SegmentedControl,
    Text,
    Tooltip,
} from "@mantine/core";
import {
    ChevronLeft,
    ChevronRight,
    LoaderCircle,
    Sparkles,
} from "lucide-react";
import { formatRange } from "@/lib/planner-dates";
import { tint } from "./planner-meta";
import type { PlannerState, PlannerView } from "./usePlanner";

const NAV_BUTTON = {
    variant: "surface",
    size: 32,
    radius: "xs",
} as const;

/**
 * Range title, prev / Today / next, the Week|Month switch and "Fill week with
 * AI" — always shown, but only usable from the week view.
 */
export function PlannerToolbar({ planner }: { planner: PlannerState }) {
    const { view, selectedDate, filling } = planner;
    const isWeek = view === "week";

    return (
        <Group gap="sm" wrap="wrap">
            <Text
                fz="xxl"
                fw={700}
                lts="var(--ls-tight)"
                style={{ whiteSpace: "nowrap" }}
            >
                {formatRange(selectedDate, view)}
            </Text>
            <Group gap="xxs" wrap="nowrap">
                <ActionIcon
                    {...NAV_BUTTON}
                    aria-label={
                        view === "month" ? "Previous month" : "Previous week"
                    }
                    onClick={() => planner.shift(-1)}
                >
                    <ChevronLeft size={16} />
                </ActionIcon>
                <Button
                    variant="surface"
                    h={32}
                    px="md"
                    radius="xs"
                    fz="xs"
                    onClick={planner.goToday}
                >
                    Today
                </Button>
                <ActionIcon
                    {...NAV_BUTTON}
                    aria-label={view === "month" ? "Next month" : "Next week"}
                    onClick={() => planner.shift(1)}
                >
                    <ChevronRight size={16} />
                </ActionIcon>
            </Group>

            <Box style={{ flex: 1 }} />

            <SegmentedControl
                radius="md"
                value={view}
                onChange={(value) => planner.setView(value as PlannerView)}
                data={[
                    { value: "week", label: "Week" },
                    { value: "month", label: "Month" },
                ]}
                styles={{
                    indicator: { borderRadius: "var(--mantine-radius-xs)" },
                    label: {
                        fontSize: "var(--mantine-font-size-xs)",
                        paddingInline: "var(--mantine-spacing-lg)",
                    },
                }}
            />

            <Tooltip
                disabled={isWeek}
                multiline
                w={240}
                withArrow
                position="bottom-end"
                label={
                    <>
                        <Text fz="xs" fw={700} c="inherit">
                            Available in Week view
                        </Text>
                        <Text fz="xs" c="inherit">
                            AI fills the empty slots one week at a time. Switch
                            to Week to use it.
                        </Text>
                    </>
                }
            >
                {/* `data-disabled` rather than `disabled`, which would
                    swallow the hover and focus the tooltip relies on. */}
                <Button
                    variant="light"
                    h={36}
                    px="md"
                    radius="md"
                    fz="sm"
                    disabled={filling}
                    data-disabled={!isWeek || undefined}
                    aria-disabled={!isWeek || undefined}
                    onClick={isWeek ? planner.fillWeek : undefined}
                    leftSection={
                        filling ? (
                            <LoaderCircle
                                size={15}
                                style={{
                                    animation: "alm-spin 0.8s linear infinite",
                                }}
                            />
                        ) : (
                            <Sparkles size={15} />
                        )
                    }
                    styles={{
                        inner: { gap: "var(--mantine-spacing-sm)" },
                        root: {
                            border: `1px solid ${tint("var(--ac)", 45)}`,
                            whiteSpace: "nowrap",
                            ...(!isWeek && {
                                background: "var(--acs)",
                                color: "var(--ac)",
                                opacity: 0.4,
                            }),
                        },
                    }}
                >
                    {filling ? "Planning your week…" : "Fill week with AI"}
                </Button>
            </Tooltip>
        </Group>
    );
}
