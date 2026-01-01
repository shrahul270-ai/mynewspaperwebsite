"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/* ================= TYPES ================= */

type AgentStatus = "pending" | "approved" | "rejected"
type Gender = "male" | "female" | "other"

interface Agent {
  full_name: string
  email: string
  mobile: string
  address: string
  state: string
  district: string
  tehsil: string
  village: string
  pincode: string
  agency_name: string
  agency_phone: string
  age: number
  gender: Gender
  status: AgentStatus
  photo?: string
}

/* ================= PAGE ================= */

export default function EditAgentPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [form, setForm] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  /* ================= FETCH AGENT ================= */

  useEffect(() => {
    if (!id) return

    fetch(`/api/admin/agents/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError(data.message || "Failed to load agent")
          return
        }
        setForm(data.agent)
      })
      .catch(() => setError("Something went wrong"))
      .finally(() => setLoading(false))
  }, [id])

  /* ================= HANDLERS ================= */

  const updateField = (key: keyof Agent, value: any) => {
    if (!form) return
    setForm({ ...form, [key]: value })
  }

  const handleSubmit = async () => {
    if (!form) return
    setSaving(true)
    setError("")

    try {
      const res = await fetch(`/api/admin/agents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.message || "Update failed")
        setSaving(false)
        return
      }

      router.push("/admin/agents")
    } catch {
      setError("Server error")
    } finally {
      setSaving(false)
    }
  }

  /* ================= UI ================= */

  if (loading) return <div className="p-6">Loading...</div>
  if (!form) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Agent</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <Label>Full Name</Label>
            <Input
              value={form.full_name}
              onChange={(e) => updateField("full_name", e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <Label>Email</Label>
            <Input
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          {/* Mobile */}
          <div>
            <Label>Mobile</Label>
            <Input
              value={form.mobile}
              onChange={(e) => updateField("mobile", e.target.value)}
            />
          </div>

          {/* Agency */}
          <div>
            <Label>Agency Name</Label>
            <Input
              value={form.agency_name}
              onChange={(e) => updateField("agency_name", e.target.value)}
            />
          </div>

          {/* Agency Phone */}
          <div>
            <Label>Agency Phone</Label>
            <Input
              value={form.agency_phone}
              onChange={(e) => updateField("agency_phone", e.target.value)}
            />
          </div>

          {/* Age */}
          <div>
            <Label>Age</Label>
            <Input
              type="number"
              value={form.age}
              onChange={(e) => updateField("age", Number(e.target.value))}
            />
          </div>

          {/* Gender */}
          <div>
            <Label>Gender</Label>
            <Select
              value={form.gender}
              onValueChange={(v) => updateField("gender", v as Gender)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => updateField("status", v as AgentStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
          </div>

          {/* Location */}
          <div>
            <Label>State</Label>
            <Input
              value={form.state}
              onChange={(e) => updateField("state", e.target.value)}
            />
          </div>

          <div>
            <Label>District</Label>
            <Input
              value={form.district}
              onChange={(e) => updateField("district", e.target.value)}
            />
          </div>

          <div>
            <Label>Tehsil</Label>
            <Input
              value={form.tehsil}
              onChange={(e) => updateField("tehsil", e.target.value)}
            />
          </div>

          <div>
            <Label>Village</Label>
            <Input
              value={form.village}
              onChange={(e) => updateField("village", e.target.value)}
            />
          </div>

          <div>
            <Label>Pincode</Label>
            <Input
              value={form.pincode}
              onChange={(e) => updateField("pincode", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-red-500">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>

        <Button
          variant="outline"
          onClick={() => router.push("/admin/agents")}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
