"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Home, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* 🔵 Animated background blobs */}
      <motion.div
        className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 60, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, -60, 0] }}
        transition={{ duration: 14, repeat: Infinity }}
      />

      {/* 🧠 Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Card className="relative w-[360px] border-border/50 bg-background/80 shadow-2xl backdrop-blur">
          <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
            {/* Icon */}
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10"
            >
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </motion.div>

            {/* 404 Text */}
            <div className="space-y-2">
              <h1 className="text-6xl font-extrabold tracking-tight text-primary">
                404
              </h1>
              <p className="text-xl font-semibold">Page Not Found</p>
              <p className="text-sm text-muted-foreground">
                The page you’re looking for doesn’t exist or was moved.
              </p>
            </div>

            {/* Actions */}
            <div className="flex w-full flex-col gap-3">
              <Button asChild className="gap-2">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Go Home
                </Link>
              </Button>

              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
