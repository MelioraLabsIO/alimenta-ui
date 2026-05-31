import {AiPreferencesSection} from "./components/ai-preferences-section";
import {PreferencesSection} from "./components/preferences-section";
import {ProfileSection} from "./components/profile-section";

export default function SettingsPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Manage your profile, preferences, and AI behaviour.
                </p>
            </div>

            <ProfileSection />
            <PreferencesSection />
            <AiPreferencesSection />
        </div>
    );
}
