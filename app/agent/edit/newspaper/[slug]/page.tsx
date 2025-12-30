'use client'

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

/* =====================
   Interface
===================== */
interface Newspaper {
  name: string
  price: number | string
  language: string
}

export default function Page() {
  const pathname = usePathname()
  const router = useRouter()
  const id = pathname.split("/").pop() as string

  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Newspaper>({
    name: "",
    price: "",
    language: "",
  })

  /* 🔜 Later: fetch newspaper by ID */
  useEffect(() => {
  if (!id) return

  const fetchNewspaper = async () => {
    try {
      const res = await fetch(`/api/agent/newspapers/edit/${id}`)
      const data = await res.json()

      if (!res.ok) {
        alert(data.message || "Failed to load newspaper")
        return
      }

      setForm({
        name: data.data.name,
        price: data.data.price,
        language: data.data.language,
      })
    } catch (error) {
      console.error(error)
      alert("Server error")
    }
  }

  fetchNewspaper()
}, [id])


  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    const res = await fetch(`/api/agent/newspapers/edit/${id}`, {
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

    const data = await res.json()

    if (!res.ok) {
      alert(data.message || "Update failed")
      setLoading(false)
      return
    }

    // ✅ success
    router.push("/agent/newspapers")
  } catch (error) {
    console.error(error)
    alert("Server error")
    setLoading(false)
  }
}

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Newspaper</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div className="space-y-2">
              <Label>Newspaper Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  handleChange("name", e.target.value)
                }
                required
              />
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={form.language}
                onValueChange={(value) =>
                  handleChange("language", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Marathi">Marathi</SelectItem>
                  <SelectItem value="Gujarati">Gujarati</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label>Monthly Price (₹)</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) =>
                  handleChange("price", e.target.value)
                }
                required
              />
            </div>

            {/* Action */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Newspaper"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}
