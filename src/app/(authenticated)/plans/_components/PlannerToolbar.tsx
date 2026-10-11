"use client";

import {
    ActionIcon,
    Box,
    Button,
    Group,
    SegmentedControl,
    Text,
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

/** Range title, prev / Today / next, the Week|Month switch and "Fill week with AI". */
export function PlannerToolbar({ planner }: { planner: PlannerState }) {
    const { view, selectedDate, filling } = planner;

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

            {view === "week" && (
                <Button
                    variant="light"
                    h={36}
                    px="md"
                    radius="md"
                    fz="sm"
                    disabled={filling}
                    onClick={planner.fillWeek}
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
                        },
                    }}
                >
                    {filling ? "Planning your week…" : "Fill week with AI"}
                </Button>
            )}
        </Group>
    );
}
