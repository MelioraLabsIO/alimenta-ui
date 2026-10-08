"use client";

import { ActionIcon, Box, Group, Text } from "@mantine/core";
import { Plus, X } from "lucide-react";
import { Autocomplete } from "@/components/foods/autocomplete";
import type { FoodSearchItem } from "@/apis/food/queries";
import { SettingsGroup } from "./SettingsGroup";
import { tint } from "./settings-types";

type PreferenceTagInputProps = {
    label: string;
    placeholder: string;
    items: string[];
    selectedFood: FoodSearchItem | null;
    onSelectedFoodChangeAction: (food: FoodSearchItem) => void;
    onAddItemAction: () => void;
    onRemoveItemAction: (item: string) => void;
    /** Design token the group is tinted with, e.g. `"var(--am)"`. */
    accent?: string;
};

/** One "Dislikes" / "Allergies" group: tinted chips plus a search-to-add row. */
export function PreferenceTagInput({
    label,
    placeholder,
    items,
    selectedFood,
    onSelectedFoodChangeAction,
    onAddItemAction,
    onRemoveItemAction,
    accent = "var(--ac)",
}: PreferenceTagInputProps) {
    return (
        <SettingsGroup label={label} padded>
            <Group gap="xs" mih={32}>
                {items.map((item) => (
                    <Group
                        key={item}
                        gap="xxs"
                        wrap="nowrap"
                        h={32}
                        pl="md"
                        pr="xs"
                        bg={tint(accent)}
                        c={accent}
                        style={{ borderRadius: "var(--mantine-radius-sm)" }}
                    >
                        <Text fz="sm" fw={600} c="inherit">
                            {item}
                        </Text>
                        <ActionIcon
                            type="button"
                            variant="transparent"
                            size={22}
                            radius="pill"
                            aria-label={`Remove ${item}`}
                            style={{ color: "inherit" }}
                            onClick={() => onRemoveItemAction(item)}
                        >
                            <X size={12} />
                        </ActionIcon>
                    </Group>
                ))}
            </Group>

            <Group gap="xs" wrap="nowrap" align="stretch" mt="md">
                <Box style={{ flex: 1, minWidth: 0 }}>
                    <Autocomplete
                        value={selectedFood}
                        placeholder={placeholder}
                        onChange={onSelectedFoodChangeAction}
                    />
                </Box>
                <ActionIcon
                    type="button"
                    variant="surface"
                    size={44}
                    radius="sm"
                    bg="var(--sf)"
                    aria-label={`Add ${label.toLowerCase()}`}
                    onClick={onAddItemAction}
                    disabled={!selectedFood}
                >
                    <Plus size={15} />
                </ActionIcon>
            </Group>
        </SettingsGroup>
    );
}
