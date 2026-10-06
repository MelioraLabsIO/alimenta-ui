import { Check, Pencil } from "lucide-react";
import {
    Badge,
    Box,
    Button,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
} from "@mantine/core";
import type { MealDraft } from "@/apis/meal/mutations";
import { EMealType } from "@/core/types/models/meal";
import {
    MEAL_TYPE_META,
    getMealTypeMeta,
} from "@/app/(authenticated)/log/ManualForm/ManualForm";
import { ExtractedMealIngredients } from "./ExtractedMealIngredients";
import { ExtractedMealTextList } from "./ExtractedMealTextList";

type ExtractedMealCardProps = {
    draft: MealDraft;
    isSaving: boolean;
    onConfirm: () => void;
    onEdit: () => void;
};

export function ExtractedMealCard({
    draft,
    isSaving,
    onConfirm,
    onEdit,
}: ExtractedMealCardProps) {
    const meta = getMealTypeMeta(draft.mealType);
    const isKnownType =
        draft.mealType.trim().toUpperCase() in MEAL_TYPE_META &&
        draft.mealType.trim().toUpperCase() !== EMealType.OTHER;
    const typeLabel = isKnownType ? meta.label : draft.mealType || "Other";
    const hasNotes =
        draft.assumptions.length > 0 || draft.clarificationQuestions.length > 0;

    return (
        <Paper
            p={22}
            style={{ animation: "alm-in 500ms cubic-bezier(.2,.8,.2,1) both" }}
        >
            <Stack gap={16}>
                <Group
                    justify="space-between"
                    align="center"
                    gap={12}
                    wrap="nowrap"
                >
                    <Box miw={0}>
                        <Text fz={12} c="var(--tx3)">
                            We found
                        </Text>
                        <Text fz={22} fw={700} lh={1.2} lts="-0.025em">
                            {draft.mealName}
                        </Text>
                    </Box>
                    <Badge
                        color={meta.color}
                        h={30}
                        px={12}
                        leftSection={<meta.Icon size={13} />}
                        style={{ flexShrink: 0 }}
                    >
                        {typeLabel}
                    </Badge>
                </Group>

                <ExtractedMealIngredients ingredients={draft.ingredients} />

                {hasNotes && (
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={10}>
                        <ExtractedMealTextList
                            title="Assumed"
                            items={draft.assumptions}
                        />
                        <ExtractedMealTextList
                            title="Quick question"
                            items={draft.clarificationQuestions}
                            tone="amber"
                        />
                    </SimpleGrid>
                )}

                <Group gap={8}>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        loading={isSaving}
                        leftSection={<Check size={16} />}
                    >
                        Looks right, save
                    </Button>
                    <Button
                        type="button"
                        variant="default"
                        onClick={onEdit}
                        disabled={isSaving}
                        leftSection={<Pencil size={15} />}
                    >
                        Edit first
                    </Button>
                </Group>
            </Stack>
        </Paper>
    );
}
