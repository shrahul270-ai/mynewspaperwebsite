"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface Booklet {
  _id: string
  title: string
  price: number
  description: string
  status: "active" | "inactive"
}

export default function EditBookletPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [form, setForm] = useState<Booklet | null>(null)
  const [loading, setLoading] = useState(false)

  /* 📥 Fetch booklet */
  useEffect(() => {
    if (!id) return

    fetch(`/api/admin/booklets/${id}`)
      .then((res) => res.json())
      .then((data) => setForm(data))
  }, [id])

  /* ✏️ Update booklet */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    setLoading(true)

    const res = await fetch(`/api/admin/booklets/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: form.title,
        price: form.price,
        description: form.description,
        status: form.status,
      }),
    })

    setLoading(false)

    if (res.ok) {
      router.push("/admin/booklets")
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
          <CardTitle>Edit Booklet</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
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
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    status: value as "active" | "inactive",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Update Booklet"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
