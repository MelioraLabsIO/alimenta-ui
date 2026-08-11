import { Container, Stack } from "@mantine/core";
import { Button } from "@/components/mantine/ui";

type CreateSessionViewProps = {
    isCreatingSession: boolean;
    onCreateSession: () => void;
};

export function CreateSessionView({
    isCreatingSession,
    onCreateSession,
}: CreateSessionViewProps) {
    return (
        <Container size="sm" className="py-8 px-4">
            <div className="text-center">
                <Stack align="center" className="mb-4" gap={"md"}>
                    <h2>No active session</h2>

                    <Button
                        onClick={onCreateSession}
                        disabled={isCreatingSession}
                        className="min-w-32"
                        aria-label="Create shared session"
                    >
                        {isCreatingSession ? "Creating..." : "Create session"}
                    </Button>
                </Stack>
            </div>
        </Container>
    );
}
