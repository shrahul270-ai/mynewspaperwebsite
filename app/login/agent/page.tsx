"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Newspaper } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError("")

  try {
    const res = await fetch("/api/agent/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const data = await res.json()

    /* 🚫 Pending / Rejected */
    if (res.status === 403) {
      if (data.message?.toLowerCase().includes("approval")) {
        router.push("/pending-approval")
        return
      }

      if (data.message?.toLowerCase().includes("rejected")) {
        router.push("/rejected") // optional page
        return
      }
    }

    /* ❌ Other errors */
    if (!res.ok) {
      setError(data.message || "Login failed")
      return
    }

    /* ✅ Success */
    router.push("/agent/profile")
  } catch (err: any) {
    setError("Something went wrong")
  } finally {
    setLoading(false)
  }
}


  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side */}
      <div className="flex w-full items-center justify-center lg:w-1/2 p-8 bg-background">
        <Card className="mx-auto w-full max-w-md border-none shadow-none lg:shadow-sm lg:border">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-4 lg:hidden">
              <Newspaper className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight">DailyHerald</span>
            </div>
            <CardTitle className="text-3xl font-serif font-bold">
              Welcome back
            </CardTitle>
            <CardDescription>
              Enter your credentials to manage your morning delivery
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted/50"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted/50"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button variant="outline" type="button" className="w-full">
                Google
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup/agent"
                className="font-semibold text-primary hover:underline"
              >
                create account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side */}
      <div className="hidden lg:flex relative w-1/2 bg-muted">
        <div className="absolute inset-0 bg-zinc-900/40 z-10" />
        <img
          src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=2070"
          alt="Morning coffee and newspaper"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative z-20 m-auto max-w-md text-center text-white p-6">
          <Newspaper className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-4xl font-serif font-bold mb-4">
            The World, Delivered to Your Door.
          </h2>
          <p className="text-lg text-zinc-200">
            Join over 50,000 readers who start their day with the most trusted
            reporting in the country.
          </p>
        </div>
      </div>
    </div>
  )
}
