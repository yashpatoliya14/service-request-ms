"use client";

import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-6">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Service<span className="text-primary">OS</span>
          </h1>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            ⚠️ Auth Temporarily Disabled
          </p>
        </div>

        {/* Quick Access Card */}
        <Card className="border-border/50 shadow-xl shadow-primary/5">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Quick Access</CardTitle>
            <CardDescription>
              Select a role to enter the system (no credentials required)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full gap-2"
              onClick={() => router.push("/admin-dashboard")}
            >
              Enter as Admin →
            </Button>
            <Button
              className="w-full gap-2"
              variant="secondary"
              onClick={() => router.push("/hod-dashboard")}
            >
              Enter as HOD →
            </Button>
            <Button
              className="w-full gap-2"
              variant="outline"
              onClick={() => router.push("/portal-dashboard")}
            >
              Enter as User →
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex justify-center gap-6 text-xs font-medium text-muted-foreground">
          <span className="text-amber-500">🔓 Authentication bypassed for development</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ORIGINAL LOGIN PAGE (preserved for easy restoration)
// ============================================================
/*
"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "Corporate Email is required";
    if (!password) newErrors.password = "Security Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: email, Password: password }),
      });

      const data = await res.json();

      if (data.success) {
        const role = data.data?.[0]?.Role;

        if (role === "ADMIN") {
          router.push("/admin-dashboard");
        } else if (role === "HOD") {
          router.push("/hod-dashboard");
        } else {
          router.push("/portal-dashboard");
        }
      } else {
        setErrors({ email: data.message || "Login failed. Please try again." });
      }
    } catch (error) {
      setErrors({ email: "Network error. Please try again." });
    }

    setLoading(false);
  };

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
            <form onSubmit={handleLogin} noValidate className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Corporate Email</Label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${errors.email ? "text-destructive" : "text-muted-foreground"}`} />
                  <Input id="email" name="email" type="email" placeholder="name@company.com" className={`pl-10 ${errors.email ? "border-destructive focus-visible:ring-destructive/30" : ""}`} suppressHydrationWarning />
                </div>
                {errors.email && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${errors.password ? "text-destructive" : "text-muted-foreground"}`} />
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className={`pl-10 pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive/30" : ""}`} suppressHydrationWarning />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full gap-2 shadow-lg shadow-primary/25" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Access System →"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <button onClick={() => router.push("/api/auth/signup")} className="font-medium text-primary transition-colors hover:text-primary/80">
                Sign up
              </button>
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
*/