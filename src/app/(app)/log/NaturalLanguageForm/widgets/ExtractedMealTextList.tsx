type ExtractedMealTextListProps = {
    title: string;
    items: string[];
};

export function ExtractedMealTextList({title, items}: ExtractedMealTextListProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <div>
            <p className="text-xs text-muted-foreground mb-2">{title}</p>
            <div className="space-y-1">
                {items.map((item) => (
                    <p key={item} className="text-sm text-muted-foreground">{item}</p>
                ))}
            </div>
        </div>
    );
}

