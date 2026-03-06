"use client";

import {
    ShieldCheck,
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    Camera,
} from "lucide-react";
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
import {z} from "zod";

const signupSchema = z.object({
    FullName: z.string().min(3, "Full name must be at least 3 characters long"),
    Email: z.string().email("Invalid email address"),
    Phone: z.string().min(10, "Phone number must be at least 10 digits long"),
    Password: z.string().min(6, "Password must be at least 6 characters long"),
});

export default function SignupPage() {
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
                        Enterprise Security Layer
                    </p>
                </div>

                {/* Signup Card */}
                <Card className="border-border/50 shadow-xl shadow-primary/5">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl">Create an account</CardTitle>
                        <CardDescription>
                            Enter your details to get started with ServiceOS
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form noValidate className="space-y-5">
                            {/* Profile Photo */}
                            <div className="flex flex-col items-center gap-3">
                                <button
                                    type="button"
                                    className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-muted/50 transition-all hover:border-primary hover:bg-muted"
                                >
                                    <Camera className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
                                </button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="profilePhoto"
                                />
                                <span className="text-xs text-muted-foreground">
                                    Upload profile photo (optional)
                                </span>
                            </div>

                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        placeholder="John Doe"
                                        className="pl-10"
                                        suppressHydrationWarning
                                    />
                                </div>
                            </div>

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
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="+91 9876543210"
                                        className="pl-10"
                                        suppressHydrationWarning
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 pr-10"
                                        suppressHydrationWarning
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full gap-2 shadow-lg shadow-primary/25"
                            >
                                Create Account →
                            </Button>
                        </form>

                        {/* Login Link */}
                        <div className="mt-4 text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <button
                                onClick={() => router.push("/login")}
                                className="font-medium text-primary transition-colors hover:text-primary/80"
                            >
                                Sign in
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
