"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Newspaper, Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner"; // Import from sonner

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const response = await fetch("/api/customers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      // Sonner Success Message
      toast.success("Welcome back!", {
        description: "Redirecting to your delivery dashboard...",
      });

      router.push("/customer/profile");
      router.refresh(); 
    } catch (err: any) {
      // Sonner Error Message
      toast.error("Authentication Failed", {
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-white">
      {/* Visual Section (Left) */}
      <div className="relative hidden w-1/2 lg:block bg-zinc-950">
        <img
          src="https://picsum.photos/1920/1080"
          alt="Newspaper background"
          className="absolute inset-0 h-full w-full object-cover opacity-40 contrast-125 transition-opacity duration-700"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <Newspaper className="h-8 w-8 text-primary-foreground" />
            <span className="text-2xl font-serif font-bold tracking-tighter italic leading-none">The Daily Press</span>
          </Link>
          
          <div className="space-y-6">
            <h2 className="text-6xl font-serif font-bold leading-[1.1] tracking-tight">
              Quality journalism, <br /> delivered daily.
            </h2>
            <p className="max-w-md text-lg text-zinc-400 font-light leading-relaxed">
              Join thousands of readers who start their morning with the most trusted reporting in the city.
            </p>
          </div>
        </div>
      </div>

      {/* Form Section (Right) */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-[380px] space-y-10">
          <div className="space-y-3">
            <h1 className="text-4xl font-serif font-bold tracking-tight text-zinc-900">Sign In</h1>
            <p className="text-sm text-zinc-500">
              Welcome back! Please enter your details to manage your delivery.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest font-bold text-zinc-500">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                required
                disabled={isLoading}
                className="h-12 text-black border-zinc-200 focus-visible:ring-1 focus-visible:ring-zinc-950 rounded-none bg-zinc-50/50"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs uppercase tracking-widest font-bold text-zinc-500">
                  Password
                </Label>
                <Link href="#" className="text-xs font-medium text-zinc-400 hover:text-zinc-950 underline underline-offset-4 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isLoading}
                className="h-12 text-black border-zinc-200 focus-visible:ring-1 focus-visible:ring-zinc-950 rounded-none bg-zinc-50/50"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-zinc-900 text-white hover:bg-zinc-800 transition-all rounded-none font-bold text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Continue to Delivery"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-100" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold">
              <span className="bg-white px-4 text-zinc-400">Secure Access</span>
            </div>
          </div>
          <Link href="/login/agent" >
           <Button 
            variant="default" 
            type="button"
            className="w-full h-12 rounded-none font-semibold transition-colors"
          >
            I am Agent
          </Button>
          </Link>
        
        <div className="my-2"></div>

          <Button 
            variant="outline" 
            type="button"
            className="w-full h-12 border-zinc-200 hover:bg-sky-500 hover:text-white rounded-none font-semibold transition-colors"
          >
            Sign in with Google
          </Button>

          <p className="text-center text-sm text-zinc-500 pt-4">
            Don&apos;t have an account?{" "}
            <Link href="/signup/customer" className="font-bold text-zinc-950 hover:underline inline-flex items-center group">
              Subscribe Now <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}