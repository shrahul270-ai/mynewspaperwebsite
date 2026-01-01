"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AllotedCustomer {
  PB: number
  BH: number
  HT: number
  TIMES: number
  HINDU: number
  is_active: boolean
}

export default function AgentEditAllotedCustomerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  const [form, setForm] = useState<AllotedCustomer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  /* =====================
     Fetch Data
  ===================== */
  useEffect(() => {
    if (!id) {
      alert("ID missing")
      router.back()
      return
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/agent/alloted-customer/${id}`)
        if (!res.ok) throw new Error()

        const data = await res.json()

        setForm({
          PB: data.PB ?? 0,
          BH: data.BH ?? 0,
          HT: data.HT ?? 0,
          TIMES: data.TIMES ?? 0,
          HINDU: data.HINDU ?? 0,
          is_active: data.is_active ?? true,
        })
      } catch {
        alert("Data load failed")
        router.back()
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, router])

  /* =====================
     Update
  ===================== */
  const handleSave = async () => {
    if (!form || !id) return
    setSaving(true)

    try {
      const res = await fetch(`/api/agent/alloted-customer/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error()

      router.back()
    } catch {
      alert("Update failed")
    } finally {
      setSaving(false)
    }
  }

  /* =====================
     Delete
  ===================== */
  const handleDelete = async () => {
    if (!id) return

    const ok = confirm(
      "Are you sure? This will remove the allotment permanently."
    )
    if (!ok) return

    setDeleting(true)

    try {
      const res = await fetch(`/api/agent/alloted-customer/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error()

      router.back()
    } catch {
      alert("Delete failed")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div className="p-4">Loading...</div>
  if (!form) return null

  return (
    <Card className="max-w-xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>Edit Alloted Customer</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {(["PB", "BH", "HT", "TIMES", "HINDU"] as const).map((key) => (
          <div key={key}>
            <Label>{key}</Label>
            <Input
              type="number"
              value={form[key]}
              onChange={(e) =>
                setForm({ ...form, [key]: Number(e.target.value) })
              }
            />
          </div>
        ))}

        <div className="flex items-center gap-3">
          <Switch
            checked={form.is_active}
            onCheckedChange={(v) =>
              setForm({ ...form, is_active: v })
            }
          />
          <Label>Active</Label>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1"
          >
            {deleting ? "Deleting..." : "Delete Allotment"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
