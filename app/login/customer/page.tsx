"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Newspaper,
  Loader2,
  ChevronRight,
  User,
  Briefcase,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Step = "choice" | "loginRole" | "login" | "signup";
type Role = "customer" | "agent" | "hoker";

export default function LoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("choice");
  const [role, setRole] = useState<Role | null>(null);
  const [selectedLoginRole, setSelectedLoginRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle login role selection
  const handleLoginRoleSelect = (selectedRole: Role) => {
    if (selectedRole === "customer") {
      setRole("customer");
      setStep("login");
    } else {
      // For agent or hoker, redirect to specific login pages
      router.push(`/login/${selectedRole}`);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!role) return;

    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await fetch(`/api/${role}s/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials");

      toast.success("Login successful", {
        description: "Dashboard par redirect ho raha hai",
      });

      router.push(`/${role}/profile`);
      router.refresh();
    } catch (err: any) {
      toast.error("Login Failed", {
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* ================= MODAL ================= */}
      <Dialog
        open={step !== "login"}
        onOpenChange={(open) => {
          if (open) setStep("login");
        }}
        
      >
        <DialogContent className="max-w-sm rounded-none bg-background text-foreground">

          {/* STEP 1 - CHOICE (Login ya Signup) */}
          {step === "choice" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center">
                  Welcome 👋 <br />
                  <span className="text-base font-normal">स्वागत है</span>
                </DialogTitle>
                <DialogDescription className="text-center">
                  क्या आप पहले से पंजीकृत हैं?
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 pt-4">
                <Button onClick={() => setStep("loginRole")} className="w-full">
                  Login / लॉगिन करें
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setStep("signup")}
                  className="w-full"
                >
                  नया खाता बनाएं
                </Button>
              </div>
            </>
          )}

          {/* STEP 2 – LOGIN ROLE SELECTION */}
          {step === "loginRole" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-center">
                  आप कौन हैं?
                </DialogTitle>
                <DialogDescription className="text-center">
                  अपनी भूमिका चुनें
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 pt-4">
                <Button
                  className="w-full flex gap-2 justify-start"
                  onClick={() => handleLoginRoleSelect("customer")}
                >
                  <User className="h-4 w-4" /> Customer / ग्राहक
                </Button>

                <Button
                  variant="outline"
                  className="w-full flex gap-2 justify-start"
                  onClick={() => handleLoginRoleSelect("agent")}
                >
                  <Briefcase className="h-4 w-4" /> Agent / एजेंट
                </Button>

                <Button
                  variant="outline"
                  className="w-full flex gap-2 justify-start"
                  onClick={() => handleLoginRoleSelect("hoker")}
                >
                  <Truck className="h-4 w-4" /> Hoker / होकर
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setStep("choice")}
                  className="w-full"
                >
                  ← वापस जाएँ
                </Button>
              </div>
            </>
          )}

          {/* STEP 3 – SIGNUP ROLE */}
          {step === "signup" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-center">
                  खाता किसके लिए?
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3 pt-4">
                <Button
                  className="w-full"
                  onClick={() => router.push("/signup/customer")}
                >
                  Customer Account
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/signup/agent")}
                >
                  Agent Account
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setStep("choice")}
                  className="w-full"
                >
                  ← वापस जाएँ
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= LOGIN FORM (ONLY FOR CUSTOMER) ================= */}
      <div className="flex min-h-screen items-center justify-center bg-background">
        {step === "login" && role === "customer" && (
          <div className="w-full max-w-[380px] space-y-6 p-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold">
                CUSTOMER LOGIN
              </h1>
              <p className="text-muted-foreground mt-2">
                ग्राहक लॉगिन
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" required />
              </div>

              <div>
                <Label>Password</Label>
                <Input type="password" name="password" required />
              </div>

              <Button className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login / लॉगिन करें"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              नया ग्राहक?{" "}
              <button
                onClick={() => router.push("/signup/customer")}
                className="underline font-semibold"
              >
                खाता बनाएं
              </button>
            </p>

            <Button
              variant="ghost"
              onClick={() => {
                setStep("loginRole");
                setRole(null);
              }}
              className="w-full"
            >
              ← दूसरी भूमिका चुनें
            </Button>
          </div>
        )}
      </div>
    </>
  );
}