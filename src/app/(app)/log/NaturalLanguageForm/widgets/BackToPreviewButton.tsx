import {Button} from "@/components/mantine/ui";

type BackToPreviewButtonProps = {
    onBack: () => void;
};

export function BackToPreviewButton({onBack}: BackToPreviewButtonProps) {
    return (
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-xs">
                ← Back to preview
            </Button>
        </div>
    );
}

