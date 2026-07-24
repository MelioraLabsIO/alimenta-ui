import {Loader2, Sparkles} from "lucide-react";
import {Button, Text, Textarea} from "@/components/mantine/ui";

type NaturalLanguageInputSectionProps = {
    text: string;
    error: string;
    isExtracting: boolean;
    onAnalyze: () => void;
    onTextChange: (value: string) => void;
};

export function NaturalLanguageInputSection({
    text,
    error,
    isExtracting,
    onAnalyze,
    onTextChange,
}: NaturalLanguageInputSectionProps) {
    return (
        <>
            <div className="space-y-1.5">
                <Text>Describe your meal</Text>
                <Textarea
                    id="nl-input"
                    placeholder="e.g. I had a big bowl of oatmeal with banana and almond milk for breakfast, plus a black coffee"
                    value={text}
                    disabled={isExtracting}
                    onChange={(e) => onTextChange(e.target.value)}
                    rows={4}
                    className={error ? "border-destructive" : ""}
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <Button onClick={onAnalyze} disabled={isExtracting} className="gap-2">
                {isExtracting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4"/>}
                {isExtracting ? "Extracting…" : "Extract Meal"}
            </Button>
        </>
    );
}

