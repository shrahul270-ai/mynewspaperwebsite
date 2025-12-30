"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/* ================= TYPES ================= */

interface Hoker {
  _id: string
  full_name: string
}

interface Newspaper {
  _id: string
  name: string
  language: string
  price: number
}

interface Booklet {
  _id: string
  title: string
  price: number
}

/* ================= PAGE ================= */

export default function DeliveryPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const customerId = searchParams.get("id")

  const [hokers, setHokers] = useState<Hoker[]>([])
  const [newspapers, setNewspapers] = useState<Newspaper[]>([])
  const [booklets, setBooklets] = useState<Booklet[]>([])

  const [selectedHoker, setSelectedHoker] = useState("")
  const [date, setDate] = useState("")

  const [newsQty, setNewsQty] = useState<Record<string, number>>({})
  const [bookletQty, setBookletQty] = useState<Record<string, number>>({})

  const [extra, setExtra] = useState({ reason: "", qty: 0 })
  const [remarks, setRemarks] = useState("")
  const [saving, setSaving] = useState(false)

  /* ================= FETCH ================= */

  useEffect(() => {
    if (!customerId) {
      router.replace("/agent/customers")
      return
    }

    const load = async () => {
      const res = await fetch(
        `/api/agent/hokers/delivery/get?id=${customerId}`
      )
      const data = await res.json()

      if (!data.success) {
        alert(data.message)
        router.replace("/agent/customers")
        return
      }

      setHokers(data.hokers || [])
      setNewspapers(data.newspapers || [])
      setBooklets(data.booklets || [])
    }

    load()
  }, [customerId, router])

  /* ================= SAVE ================= */

  const handleSubmit = async () => {
    if (!selectedHoker || !date) {
      alert("Hoker and Date required")
      return
    }

    const selectedNewspapers = newspapers
      .filter(n => newsQty[n._id] > 0)
      .map(n => ({
        newspaperId: n._id,
        qty: newsQty[n._id],
        price: n.price,
      }))

    const selectedBooklets = booklets
      .filter(b => bookletQty[b._id] > 0)
      .map(b => ({
        bookletId: b._id,
        qty: bookletQty[b._id],
        price: b.price,
      }))

    setSaving(true)

    const res = await fetch("/api/agent/hokers/delivery/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        hokerId: selectedHoker,
        date,
        newspapers: selectedNewspapers,
        booklets: selectedBooklets,
        extra: extra.qty > 0 ? extra : null,
        remarks,
      }),
    })

    const data = await res.json()
    setSaving(false)

    if (!data.success) {
      alert(data.message)
      return
    }

    alert("Delivery saved ✅")
    router.back()
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>🛵 Delivery Entry</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Hoker */}
          <Select value={selectedHoker} onValueChange={setSelectedHoker}>
            <SelectTrigger>
              <SelectValue placeholder="Select Hoker" />
            </SelectTrigger>
            <SelectContent>
              {hokers.map(h => (
                <SelectItem key={h._id} value={h._id}>
                  {h.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date */}
          <Input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />

          {/* Newspapers */}
          <div>
            <Label>Newspapers</Label>
            {newspapers.map(n => (
              <Select
                key={n._id}
                onValueChange={val =>
                  setNewsQty({ ...newsQty, [n._id]: Number(val) })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue
                    placeholder={`${n.name} (${n.language}) - ₹${n.price}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5].map(q => (
                    <SelectItem key={q} value={String(q)}>
                      Qty {q}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>

          {/* Booklets */}
          <div>
            <Label>Booklets</Label>
            {booklets.map(b => (
              <Select
                key={b._id}
                onValueChange={val =>
                  setBookletQty({ ...bookletQty, [b._id]: Number(val) })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue
                    placeholder={`${b.title} - ₹${b.price}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5].map(q => (
                    <SelectItem key={q} value={String(q)}>
                      Qty {q}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>

          {/* Extra */}
          <div>
            <Label>Extra Delivery</Label>
            <Input
              placeholder="Reason"
              className="mt-2"
              onChange={e =>
                setExtra({ ...extra, reason: e.target.value })
              }
            />
            <Input
              type="number"
              placeholder="Qty"
              className="mt-2"
              onChange={e =>
                setExtra({ ...extra, qty: Number(e.target.value) })
              }
            />
          </div>

          {/* Remarks */}
          <Textarea
            placeholder="Remarks"
            onChange={e => setRemarks(e.target.value)}
          />

          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full"
          >
            {saving ? "Saving..." : "Save Delivery"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
