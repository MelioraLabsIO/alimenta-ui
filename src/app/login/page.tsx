"use client";

import { useState } from "react";
import { forgotPassword, login, signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const result = isForgotPassword
        ? await forgotPassword(formData)
        : isSignUp
          ? await signup(formData)
          : await login(formData);

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        if ("message" in result && typeof result.message === "string" && result.message) {
          toast.success(result.message);
        } else {
          toast.success(isSignUp ? "Account created!" : "Welcome back!");
          // Explicit redirect on client side if successful
          window.location.href = "/";
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Abstract background blobs for modern feel */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[120px] rounded-full" />
      
      <div className="w-full max-w-sm space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-2">
            <span className="text-2xl">🌿</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
            {isForgotPassword ? "Reset your password" : isSignUp ? "Create an account" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground text-sm px-4 mb-2">
            {isForgotPassword
              ? "Enter your email and we will send you a reset link"
              : isSignUp 
              ? "Start tracking your food and wellness journey" 
              : "Sign in to your account to continue"}
          </p>
        </div>

        <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-semibold">
                {isForgotPassword ? "Forgot Password" : isSignUp ? "Sign Up" : "Login"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isForgotPassword
                  ? "We will email you a secure reset link"
                  : "Enter your credentials to access your dashboard"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSignUp && !isForgotPassword && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">First name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required={isSignUp}
                      disabled={loading}
                      className="bg-background/50 border-border/50 focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">Last name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required={isSignUp}
                      disabled={loading}
                      className="bg-background/50 border-border/50 focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  disabled={loading}
                  className="bg-background/50 border-border/50 focus:border-emerald-500/50 transition-colors"
                />
              </div>
              {!isForgotPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" title="Password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">Password</Label>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={loading}
                  className="bg-background/50 border-border/50 focus:border-emerald-500/50 transition-colors"
                />
              </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button
                type="submit"
                variant="outline"
                className="w-full border-emerald-500/60 text-emerald-400 font-medium transition-all hover:bg-emerald-500/10 hover:text-emerald-300"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isForgotPassword ? "Send Reset Link" : isSignUp ? "Create Account" : "Sign In"}
              </Button>

              {!isSignUp && !isForgotPassword && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                  disabled={loading}
                >
                  Forgot your password?
                </Button>
              )}

              {isForgotPassword && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsForgotPassword(false)}
                  className="text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                  disabled={loading}
                >
                  Back to sign in
                </Button>
              )}
              
              <div className="text-center text-xs">
                <span className="text-muted-foreground">
                  {isSignUp ? "Already have an account? " : "Don't have an account? "}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setIsSignUp(!isSignUp);
                  }}
                  className="text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                  disabled={loading}
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
