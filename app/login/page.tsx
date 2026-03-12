"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/apiClient";
import { Label } from "@radix-ui/react-label";
import { useActionState } from "react";
import z from "zod";

interface LoginState {
  errors: Record<string, string>;
  message: string;
}

const initialState: LoginState = {
  errors: {},
  message: "",
}

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});
// ============================================================
// ORIGINAL LOGIN PAGE (preserved for easy restoration)
// ============================================================



export default function LoginPage() {

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async (_prevState: LoginState, formData: FormData): Promise<LoginState> => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        fieldErrors[key] = issue.message;
      }
      return { errors: fieldErrors, message: "Validation failed" };
    }
    let needsPasswordReset = false;
    try {
      const res1 = await apiClient.get(`/api/auth/is_dept_person?email=${encodeURIComponent(result.data.email)}`);
      if (res1.success) {
        needsPasswordReset = true;
      }
    } catch (e) {
      console.log("Normal login flow routing:", e instanceof Error ? e.message : e);
    }

    if (needsPasswordReset) {
      router.push("/reset-password")
      return { errors: {}, message: "" };
    }
    
    try {
      const res = await apiClient.post("/api/auth/login", { Email: result.data.email, Password: result.data.password });
        if (res.success) {
          // Redirect based on user role
          const role = (res.data as any)?.[0]?.Role?.toLowerCase() ?? "user";
          const dashboardMap: Record<string, string> = {
            admin: "/admin-dashboard",
            hod: "/hod-dashboard",
            user: "/portal-dashboard",
          };
          router.push(dashboardMap[role] || "/portal-dashboard");
          return { errors: {}, message: "" };
        } else {
          return { errors: {}, message: res.message || "Invalid credentials" };
        }
    } catch (error) {
      console.error(error);
      return {
        errors: {},
        message: error instanceof Error ? error.message : "Login failed. Please try again.",
      };
    }
    return { errors: {}, message: "" };
  };

  const [state, formAction, isPending] = useActionState(handleLogin, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Service<span className="text-primary">OS</span>
          </h1>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Enterprise Security Layer
          </p>
        </div>

        <Card className="border-border/50 shadow-xl shadow-primary/5">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} noValidate className="space-y-5">
              {state.message && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm font-medium text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {state.message}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Corporate Email</Label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${state.errors.email ? "text-destructive" : "text-muted-foreground"}`} />
                  <Input id="email" name="email" type="email" placeholder="name@company.com" className={`pl-10 ${state.errors.email ? "border-destructive focus-visible:ring-destructive/30" : ""}`} suppressHydrationWarning />
                </div>
                {state.errors.email && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {state.errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${state.errors.password ? "text-destructive" : "text-muted-foreground"}`} />
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className={`pl-10 pr-10 ${state.errors.password ? "border-destructive focus-visible:ring-destructive/30" : ""}`} suppressHydrationWarning />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {state.errors.password && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {state.errors.password}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full gap-2 shadow-lg shadow-primary/25" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Access System →"
                )}
              </Button>
            </form>

            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <button type="button" onClick={() => router.push("/reset-password")} className="font-medium text-primary transition-colors hover:text-primary/80">
                Forgot Password?
              </button>
              <span>
                Don&apos;t have an account?{" "}
                <button onClick={() => router.push("/signup")} className="font-medium text-primary transition-colors hover:text-primary/80">
                  Sign up
                </button>
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-6 text-xs font-medium text-muted-foreground">
          <button className="transition-colors hover:text-primary">Privacy Policy</button>
          <span>•</span>
          <button className="transition-colors hover:text-primary">Support Center</button>
        </div>
      </div>
    </div>
  );
}