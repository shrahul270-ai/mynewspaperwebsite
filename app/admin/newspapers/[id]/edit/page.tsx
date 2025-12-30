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
  price: number
  language: string
}

export default function EditNewspaperPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [form, setForm] = useState<Newspaper | null>(null)
  const [loading, setLoading] = useState(false)

  /* 📥 Fetch newspaper */
  useEffect(() => {
    if (!id) return

    fetch(`/api/admin/newspapers/${id}`)
      .then((res) => res.json())
      .then((data) => setForm(data))
  }, [id])

  /* ✏️ Update */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    setLoading(true)

    const res = await fetch(`/api/admin/newspapers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        price: form.price,
        language: form.language,
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
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <Label>Price</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: Number(e.target.value),
                  })
                }
                required
              />
            </div>

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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Update Newspaper"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
