"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/mantine/ui";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/mantine/ui";
import { Input } from "@/components/mantine/ui";
import { Text } from "@/components/mantine/ui";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const password = (formData.get("password") as string | null)?.trim() ?? "";
      const confirmPassword = (formData.get("confirmPassword") as string | null)?.trim() ?? "";

      if (!password || !confirmPassword) {
        toast.error("Please fill in both password fields.");
        return;
      }

      if (password.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password updated. You can now sign in.");
      router.push("/login");
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl">
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-semibold">Set new password</CardTitle>
            <CardDescription className="text-xs">
              Enter your new password below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Text className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
                New password
              </Text>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={loading}
                className="bg-background/50 border-border/50 focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Text className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
                Confirm password
              </Text>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                disabled={loading}
                className="bg-background/50 border-border/50 focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              variant="outline"
              className="w-full border-emerald-500/60 text-emerald-400 font-medium transition-all hover:bg-emerald-500/10 hover:text-emerald-300"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
