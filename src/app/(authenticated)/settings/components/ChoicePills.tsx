"use client";

import { Group, UnstyledButton } from "@mantine/core";
import { SettingsGroup } from "./SettingsGroup";
import { tint } from "./settings-types";

/**
 * A single-choice preference as a row of pills. Tapping the picked pill
 * again clears it, since every single choice on the profile is optional.
 */
export function ChoicePills<T extends string>({
    label,
    options,
    labels,
    value,
    onChange,
    accent = "var(--ac)",
}: {
    label: string;
    options: readonly T[];
    labels: Record<T, string>;
    value: T | null;
    onChange: (value: T | null) => void;
    /** Design token the picked pill is tinted with. */
    accent?: string;
}) {
    return (
        <SettingsGroup label={label} requirement="optional" padded>
            <Group gap="xs" role="radiogroup" aria-label={label}>
                {options.map((option) => {
                    const selected = option === value;

                    return (
                        <UnstyledButton
                            key={option}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => onChange(selected ? null : option)}
                            h={34}
                            px="md"
                            fz="sm"
                            fw={600}
                            bg={selected ? tint(accent, 18) : "var(--sf)"}
                            c={selected ? accent : "var(--tx2)"}
                            style={{
                                borderRadius: "var(--mantine-radius-pill)",
                                border: `1px solid ${
                                    selected
                                        ? `color-mix(in srgb, ${accent} 45%, transparent)`
                                        : "var(--bd)"
                                }`,
                                whiteSpace: "nowrap",
                                transition:
                                    "background-color var(--motion-fast), color var(--motion-fast)",
                            }}
                        >
                            {labels[option]}
                        </UnstyledButton>
                    );
                })}
            </Group>
        </SettingsGroup>
    );
}
