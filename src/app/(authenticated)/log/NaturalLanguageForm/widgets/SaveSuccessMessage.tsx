import {CheckCircle2} from "lucide-react";

export function SaveSuccessMessage() {
    return (
        <div className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 className="h-4 w-4"/> Meal saved successfully!
        </div>
    );
}

