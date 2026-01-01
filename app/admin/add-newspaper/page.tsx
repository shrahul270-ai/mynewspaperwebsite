'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

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

export default function AddAgentNewspaper() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    price: "",
    language: "",
  })

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/agent/newspapers/add", {
        method: "POST",
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
        alert(data.message || "Something went wrong")
        setLoading(false)
        return
      }

      // ✅ Success
      router.push("/admin/newspapers")
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
          <CardTitle>Add Newspaper</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Newspaper Name */}
            <div className="space-y-2">
              <Label>Newspaper Name</Label>
              <Input
                placeholder="Eg. Times of India"
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
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Marathi">Marathi</SelectItem>
                  <SelectItem value="Gujarati">Gujarati</SelectItem>
                  <SelectItem value="Punjabi">Punjabi</SelectItem>
                  <SelectItem value="Bengali">Bengali</SelectItem>
                  <SelectItem value="Tamil">Tamil</SelectItem>
                  <SelectItem value="Telugu">Telugu</SelectItem>
                  <SelectItem value="Kannada">Kannada</SelectItem>
                  <SelectItem value="Malayalam">Malayalam</SelectItem>
                  <SelectItem value="Odia">Odia</SelectItem>
                  <SelectItem value="Assamese">Assamese</SelectItem>
                  <SelectItem value="Urdu">Urdu</SelectItem>
                  <SelectItem value="Sanskrit">Sanskrit</SelectItem>
                  <SelectItem value="Konkani">Konkani</SelectItem>
                  <SelectItem value="Sindhi">Sindhi</SelectItem>
                  <SelectItem value="Nepali">Nepali</SelectItem>
                  <SelectItem value="Maithili">Maithili</SelectItem>
                  <SelectItem value="Bhojpuri">Bhojpuri</SelectItem>
                  <SelectItem value="Rajasthani">Rajasthani</SelectItem>
                </SelectContent>

              </Select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label>One Item Price (₹)</Label>
              <Input
                type="number"
                placeholder="Eg. 4"
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
              {loading ? "Saving..." : "Add Newspaper"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}
