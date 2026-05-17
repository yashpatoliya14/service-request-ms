"use client";

import { ShieldCheck, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
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

const resetSchema = z.object({
    Email: z.string().email("Please enter a valid email address"),
});

interface ResetState {
    error: string;
    message: string;
}

const initialState: ResetState = {
    error: "",
    message: "",
};

export default function ResetPasswordPage() {
    const router = useRouter();

    const handleResetPassword = async (
        _prevState: ResetState,
        formData: FormData,
    ): Promise<ResetState> => {
        const rawValues = {
            Email: formData.get("email") as string,
        };

        const result = resetSchema.safeParse(rawValues);

        if (!result.success) {
            return {
                error: result.error.issues[0].message,
                message: "",
            };
        }

        try {
            const res = await apiClient.post("/api/auth/send_reset_otp", result.data);
            if (res.success) {
                router.replace(
                    "/verify-otp?email=" + encodeURIComponent(result.data.Email) + "&isForgotPassword=true",
                );
            }
            return {
                error: "",
                message: res.message || "OTP sent to your email",
            };
        } catch (error) {
            console.error(error);
            return {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to send reset email. Please try again.",
                message: "",
            };
        }
    };

    const [state, formAction, isPending] = useActionState(
        handleResetPassword,
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

                {/* Reset Password Card */}
                <Card className="border-border/50 shadow-xl shadow-primary/5">
                    <CardHeader className="space-y-1 pb-4">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-center text-xl">
                            Reset Password
                        </CardTitle>
                        <CardDescription className="text-center">
                            Enter your corporate email and we&apos;ll send you a
                            verification code to reset your password
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form noValidate action={formAction} className="space-y-5">
                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Corporate Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        className="pl-10"
                                        suppressHydrationWarning
                                    />
                                </div>
                                {state.error && (
                                    <p className="text-xs text-destructive">
                                        {state.error}
                                    </p>
                                )}
                            </div>

                            {/* Success Message */}
                            {state.message && (
                                <p className="text-center text-sm font-medium text-emerald-600">
                                    {state.message}
                                </p>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full gap-2 shadow-lg shadow-primary/25"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Send Verification Code →"
                                )}
                            </Button>
                        </form>

                        {/* Back to Login */}
                        <div className="mt-4 text-center text-sm text-muted-foreground">
                            Remember your password?{" "}
                            <button
                                onClick={() => router.replace("/login")}
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
