import type {
    GeneralPreferences,
    GeneralPreferencesUpdate,
    Goal,
    Units,
} from "@/core/types/models/profile";

/** What the settings page shows before the user has picked a goal. */
export const DEFAULT_GOAL: Goal = "maintain";
/** What the settings page shows before the user has picked units. */
export const DEFAULT_UNITS: Units = "metric";

/** The goal and units being edited on the settings page. */
export type GeneralPreferencesValues = { goal: Goal; units: Units };

/** The saved goal and units, or the defaults where none is saved yet. */
export function toGeneralPreferencesValues(
    profile: GeneralPreferences | null | undefined
): GeneralPreferencesValues {
    return {
        goal: profile?.goal ?? DEFAULT_GOAL,
        units: profile?.units ?? DEFAULT_UNITS,
    };
}

/**
 * Only the fields the user changed, for `PATCH /api/v1/profile`. Empty when
 * nothing changed, so the caller can keep Save disabled.
 */
export function changedGeneralPreferences(
    saved: GeneralPreferencesValues,
    draft: GeneralPreferencesValues
): GeneralPreferencesUpdate {
    const update: GeneralPreferencesUpdate = {};
    if (draft.goal !== saved.goal) update.goal = draft.goal;
    if (draft.units !== saved.units) update.units = draft.units;
    return update;
}
