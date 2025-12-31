"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, EyeOff, KeyRound } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function HokerChangePasswordPage() {
  const router = useRouter()

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/hoker/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword,
          newPassword,
          confirmPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message || "Failed to change password")
        setLoading(false)
        return
      }

      toast.success("Password changed successfully")

      // optional: logout ya dashboard redirect
      router.push("/hoker/dashboard")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Old Password */}
            <div className="space-y-1">
              <Label>Old Password</Label>
              <div className="relative">
                <Input
                  type={showOld ? "text" : "password"}
                  placeholder="Default: 2026"
                  value={oldPassword}
                  onChange={(e) =>
                    setOldPassword(e.target.value)
                  }
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-muted-foreground"
                  onClick={() => setShowOld(!showOld)}
                >
                  {showOld ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <Label>New Password</Label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-muted-foreground"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <Label>Confirm Password</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-muted-foreground"
                  onClick={() =>
                    setShowConfirm(!showConfirm)
                  }
                >
                  {showConfirm ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <Button
              className="w-full"
              disabled={loading}
            >
              {loading ? "Updating..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
