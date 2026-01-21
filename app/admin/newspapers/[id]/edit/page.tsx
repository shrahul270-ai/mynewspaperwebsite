"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface Newspaper {
  _id: string
  name: string
  language: string
  price: {
    monday: number | string
    tuesday: number | string
    wednesday: number | string
    thursday: number | string
    friday: number | string
    saturday: number | string
    sunday: number | string
  }
}

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
]

export default function EditNewspaperPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [form, setForm] = useState<Newspaper | null>(null)
  const [loading, setLoading] = useState(false)

  /* 📥 Fetch */
  useEffect(() => {
    if (!id) return

    fetch(`/api/admin/newspapers/${id}`)
      .then((res) => res.json())
      .then((data) => setForm(data))
  }, [id])

  /* ✏️ Submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    setLoading(true)

    const res = await fetch(`/api/admin/newspapers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        language: form.language,
        price: {
          monday: Number(form.price.monday),
          tuesday: Number(form.price.tuesday),
          wednesday: Number(form.price.wednesday),
          thursday: Number(form.price.thursday),
          friday: Number(form.price.friday),
          saturday: Number(form.price.saturday),
          sunday: Number(form.price.sunday),
        },
      }),
    })

    setLoading(false)

    if (res.ok) {
      router.push("/admin/newspapers")
    }
  }

  if (!form) {
    return (
      <div className="flex justify-center mt-10">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Newspaper</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
              />
            </div>

            {/* Language */}
            <div>
              <Label>Language</Label>
              <Input
                value={form.language}
                onChange={(e) =>
                  setForm({ ...form, language: e.target.value })
                }
                required
              />
            </div>

            {/* Prices */}
            <div className="space-y-3">
              <Label>Price per Day (₹)</Label>

              <div className="grid grid-cols-2 gap-3">
                {DAYS.map((day) => (
                  <div key={day.key}>
                    <Label className="text-sm">{day.label}</Label>
                    <Input
                      type="number"
                      value={form.price[day.key as keyof typeof form.price]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          price: {
                            ...form.price,
                            [day.key]: e.target.value,
                          },
                        })
                      }
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Update Newspaper"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}
