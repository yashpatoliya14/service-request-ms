"use client";

import { Suspense } from "react";
import { ShieldCheck, KeyRound, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AuthService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState } from "react";
import { apiClient } from "@/lib/apiClient";

interface OtpState {
    error: string;
    message: string;
}

const initialState: OtpState = {
    error: "",
    message: "",
};

function VerifyOtpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") ?? "";
    const isForgotPassword = searchParams.get("isForgotPassword") === "true";

    const handleVerifyOtp = async (
        _prevState: OtpState,
        formData: FormData,
    ): Promise<OtpState> => {
        const otp = formData.get("otp") as string;

        if (!otp || otp.length < 4) {
            return { error: "Please enter a valid OTP", message: "" };
        }

        try {
            const res = await AuthService.verifyOTP({ Email: email, Otp: otp, isForgotPassword });
            if (res.success && isForgotPassword) {
                router.replace("/new-password?email=" + encodeURIComponent(email));
            } else if (res.success) {

                router.replace("/login");
            } else {
                console.log(res);

                return { error: "Error", message: res.message }
            }
            return { error: "", message: "" };
        } catch (error) {
            console.error(error);
            return {
                error: error instanceof Error ? error.message : "Signup failed. Please try again.",
                message: "",
            };
        }

        return { error: "", message: "" };
    };

    const [state, formAction, isPending] = useActionState(handleVerifyOtp, initialState);

    //TODO:implement toaster or message
    const handleResendOtp = async () => {
        await apiClient.post("/api/auth/resend-otp", { Email: email });
    };

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

                {/* OTP Card */}
                <Card className="border-border/50 shadow-xl shadow-primary/5">
                    <CardHeader className="space-y-1 pb-4">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <KeyRound className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-center text-xl">
                            Verify OTP
                        </CardTitle>
                        <CardDescription className="text-center">
                            {email ? (
                                <>
                                    We&apos;ve sent a verification code to{" "}
                                    <span className="font-medium text-foreground">
                                        {email}
                                    </span>
                                </>
                            ) : (
                                "Enter the verification code sent to your email"
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form noValidate action={formAction} className="space-y-5">
                            {/* OTP Input */}
                            <div className="space-y-2">
                                <Label htmlFor="otp">Verification Code</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="Enter OTP"
                                        maxLength={6}
                                        className="pl-10 text-center text-lg tracking-[0.5em] font-mono"
                                        autoComplete="one-time-code"
                                        suppressHydrationWarning
                                    />
                                </div>
                                {state.error && (
                                    <p className="text-xs text-destructive">
                                        {state.error}
                                    </p>
                                )}
                            </div>

                            {/* General Message */}
                            {state.message && (
                                <p className="text-center text-sm text-emerald-600">
                                    {state.message}
                                </p>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full gap-2 shadow-lg shadow-primary/25"
                            >
                                {isPending
                                    ? "Verifying..."
                                    : "Verify Code →"}
                            </Button>
                        </form>

                        {/* Resend OTP */}
                        <div className="mt-4 text-center text-sm text-muted-foreground">
                            Didn&apos;t receive the code?{" "}
                            <button
                                onClick={handleResendOtp}
                                className="font-medium text-primary transition-colors hover:text-primary/80"
                            >
                                Resend OTP
                            </button>
                        </div>

                        {/* Back to Login */}
                        <div className="mt-3 text-center text-sm text-muted-foreground">
                            <button
                                onClick={() => router.replace("/login")}
                                className="font-medium text-primary transition-colors hover:text-primary/80"
                            >
                                ← Back to Login
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

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <VerifyOtpContent />
        </Suspense>
    );
}
