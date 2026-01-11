"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

/* ================= TYPES ================= */

interface AllotedCustomer {
  PB: number
  BH: number
  HT: number
  TIMES: number
  HINDU: number
  is_active: boolean
}

interface Hoker {
  _id: string
  full_name: string
  email: string
  mobile: string
  photo?: string
}

/* ================= PAGE ================= */

export default function AgentEditAllotedCustomerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  const [form, setForm] = useState<AllotedCustomer | null>(null)
  const [hokers, setHokers] = useState<Hoker[]>([])
  const [selectedHoker, setSelectedHoker] = useState("")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return router.back()

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/agent/alloted-customer/${id}`)
        const data = await res.json()

        setForm({
          PB: data.allotedCustomer?.PB ?? 0,
          BH: data.allotedCustomer?.BH ?? 0,
          HT: data.allotedCustomer?.HT ?? 0,
          TIMES: data.allotedCustomer?.TIMES ?? 0,
          HINDU: data.allotedCustomer?.HINDU ?? 0,
          is_active: data.allotedCustomer?.is_active ?? true,
        })

        setHokers(data.availableHokers || [])
        setSelectedHoker(
          data.customerHokers?.[0]?._id || ""
        )
      } catch {
        alert("Failed to load data")
        router.back()
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, router])

  const handleSave = async () => {
    if (!form) return
    setSaving(true)

    try {
      await fetch(`/api/agent/alloted-customer/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          hokerId: selectedHoker || null,
        }),
      })
      router.back()
    } catch {
      alert("Update failed")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Remove allotment permanently?")) return
    setDeleting(true)

    try {
      await fetch(`/api/agent/alloted-customer/${id}`, {
        method: "DELETE",
      })
      router.back()
    } catch {
      alert("Delete failed")
    } finally {
      setDeleting(false)
    }
  }

  if (loading || !form) return <div className="p-6">Loading...</div>

  return (
    <Card className="max-w-2xl mx-auto mt-8 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">
          Edit Alloted Customer
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 📰 Newspapers */}
        <div>
          <h3 className="text-sm font-medium mb-3 text-muted-foreground">
            Newspaper Quantity
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {(["PB", "BH", "HT", "TIMES", "HINDU"] as const).map((key) => (
              <div key={key}>
                <Label className="text-xs">{key}</Label>
                <Input
                  type="number"
                  value={form[key]}
                  onChange={(e) =>
                    setForm({ ...form, [key]: Number(e.target.value) })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* ⚡ Status */}
        <div className="flex items-center justify-between">
          <Label className="text-sm">Active Status</Label>
          <Switch
            checked={form.is_active}
            onCheckedChange={(v) =>
              setForm({ ...form, is_active: v })
            }
          />
        </div>

        <Separator />

        {/* 👷 Hoker */}
        <div>
          <Label className="text-sm mb-1 block">
            Assign Hoker
          </Label>
          <Select
            value={selectedHoker}
            onValueChange={setSelectedHoker}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select hoker" />
            </SelectTrigger>
            <SelectContent>
              {hokers.map((h) => (
                <SelectItem key={h._id} value={h._id}>
                  {h.full_name} • {h.mobile}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 🔘 Actions */}
        <div className="flex gap-3 pt-4">
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
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
