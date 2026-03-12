"use client";

import { useState, Suspense } from "react";
import { ShieldCheck, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useActionState } from "react";
import { apiClient } from "@/lib/apiClient";

const newPasswordSchema = z
    .object({
        password: z.string().min(6, "Password must be at least 6 characters long"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

interface NewPasswordState {
    errors: Record<string, string>;
    message: string;
}

const initialState: NewPasswordState = {
    errors: {},
    message: "",
};

function NewPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") ?? "";
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleNewPassword = async (
        _prevState: NewPasswordState,
        formData: FormData,
    ): Promise<NewPasswordState> => {
        const rawValues = {
            password: formData.get("password") as string,
            confirmPassword: formData.get("confirmPassword") as string,
        };

        const result = newPasswordSchema.safeParse(rawValues);

        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            for (const issue of result.error.issues) {
                const key = issue.path[0] as string;
                fieldErrors[key] = issue.message;
            }
            return { errors: fieldErrors, message: "" };
        }

        if (!email) {
            return { errors: {}, message: "Email is missing. Please start the reset process again." };
        }

        try {
            const res = await apiClient.post("/api/auth/reset_password", {
                Email: email,
                Password: result.data.password,
            });
            if (res.success) {
                router.push("/login");
            } else {
                return {
                    errors: {},
                    message: res.message || "Failed to reset password.",
                };
            }
            return { errors: {}, message: "" };
        } catch (error) {
            console.error(error);
            return {
                errors: {},
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to reset password. Please try again.",
            };
        }
    };

    const [state, formAction, isPending] = useActionState(
        handleNewPassword,
        initialState,
    );

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
                        Enterprise Security Layer
                    </p>
                </div>

                {/* New Password Card */}
                <Card className="border-border/50 shadow-xl shadow-primary/5">
                    <CardHeader className="space-y-1 pb-4">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Lock className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-center text-xl">
                            Set New Password
                        </CardTitle>
                        <CardDescription className="text-center">
                            {email ? (
                                <>
                                    Create a new password for{" "}
                                    <span className="font-medium text-foreground">
                                        {email}
                                    </span>
                                </>
                            ) : (
                                "Enter your new password below"
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form noValidate action={formAction} className="space-y-5">
                            {/* General error message */}
                            {state.message && (
                                <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm font-medium text-destructive">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {state.message}
                                </div>
                            )}

                            {/* New Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <Lock className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${state.errors.password ? "text-destructive" : "text-muted-foreground"}`} />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className={`pl-10 pr-10 ${state.errors.password ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                                        suppressHydrationWarning
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                    >
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

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${state.errors.confirmPassword ? "text-destructive" : "text-muted-foreground"}`} />
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className={`pl-10 pr-10 ${state.errors.confirmPassword ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                                        suppressHydrationWarning
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {state.errors.confirmPassword && (
                                    <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                                        <AlertCircle className="h-3 w-3" />
                                        {state.errors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full gap-2 shadow-lg shadow-primary/25"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    "Reset Password →"
                                )}
                            </Button>
                        </form>

                        {/* Back to Login */}
                        <div className="mt-4 text-center text-sm text-muted-foreground">
                            Remember your password?{" "}
                            <button
                                onClick={() => router.push("/login")}
                                className="font-medium text-primary transition-colors hover:text-primary/80"
                            >
                                Back to Login
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="flex justify-center gap-6 text-xs font-medium text-muted-foreground">
                    <button className="transition-colors hover:text-primary">
                        Privacy Policy
                    </button>
                    <span>•</span>
                    <button className="transition-colors hover:text-primary">
                        Support Center
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function NewPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <NewPasswordContent />
        </Suspense>
    );
}
