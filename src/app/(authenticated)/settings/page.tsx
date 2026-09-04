import { AiPreferencesSection } from "./components/AiPreferencesSection";
import { PreferencesSection } from "./components/PreferencesSection";
import { ProfileSection } from "./components/ProfileSection";

export default function SettingsPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Manage your profile, preferences, and AI behavior.
                </p>
            </div>

            <ProfileSection />
            <PreferencesSection />
            <AiPreferencesSection />
        </div>
    );
}
