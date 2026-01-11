"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"

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
  email: string
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
  const [assignedHokers, setAssignedHokers] = useState<Hoker[]>([])
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
      toast.error("ग्राहक की जानकारी नहीं मिली")
      router.replace("/agent/customers")
      return
    }

    const load = async () => {
      try {
        const res = await fetch(
          `/api/agent/hokers/delivery/get?id=${customerId}`
        )
        const data = await res.json()

        if (!data.success) {
          toast.error(data.message || "डेटा लोड नहीं हो पाया")
          router.replace("/agent/customers")
          return
        }

        setHokers(data.hokers || [])
        setAssignedHokers(data.assignedHokers || [])
        setNewspapers(data.newspapers || [])
        setBooklets(data.booklets || [])

        // 👉 default select: assigned hoker (if exists)
        if (data.assignedHokers?.length > 0) {
          setSelectedHoker(data.assignedHokers[0]._id)
        }
      } catch {
        toast.error("सर्वर से कनेक्ट नहीं हो पाया")
      }
    }

    load()
  }, [customerId, router])

  /* ================= SAVE ================= */

  const handleSubmit = async () => {
    if (!selectedHoker || !date) {
      toast.warning("हॉकर और तारीख चुनना ज़रूरी है")
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

    try {
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

      if (!data.success) {
        toast.error(data.message || "डिलीवरी सेव नहीं हो पाई")
        return
      }

      toast.success("डिलीवरी सफलतापूर्वक सेव हो गई ✅")
      router.back()
    } catch {
      toast.error("कुछ गड़बड़ हो गई, दोबारा कोशिश करें")
    } finally {
      setSaving(false)
    }
  }

  /* ================= UI ================= */

  const assignedHokerChanged =
    assignedHokers.length > 0 &&
    selectedHoker &&
    selectedHoker !== assignedHokers[0]._id

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      {/* GUIDE */}
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>📢 डिलीवरी भरने की जानकारी</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>👉 हॉकर चुनें (ज़रूरत हो तो बदल सकते हैं)</p>
          <p>👉 तारीख चुनें</p>
          <p>👉 अख़बार / पुस्तिका की संख्या भरें</p>
          <p>👉 अंत में Save दबाएँ</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🛵 Delivery Entry</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* INFO */}
          {assignedHokers.length > 0 && (
            <p className="text-sm text-green-600">
              ✅ इस ग्राहक के लिए हॉकर पहले से निर्धारित है
            </p>
          )}

          {assignedHokerChanged && (
            <p className="text-sm text-orange-600">
              ⚠️ आप assigned हॉकर से अलग हॉकर चुन रहे हैं
            </p>
          )}

          {/* Hoker */}
          <div>
            <Label>Hoker</Label>
            <Select value={selectedHoker} onValueChange={setSelectedHoker}>
              <SelectTrigger className="mt-2 w-full">
                <SelectValue placeholder="Select Hoker" />
              </SelectTrigger>
              <SelectContent>
                {hokers.map(h => (
                  <SelectItem key={h._id} value={h._id}>
                    {h.full_name} ({h.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              className="mt-2"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

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
                <SelectTrigger className="mt-2 w-full">
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
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue placeholder={`${b.title} - ₹${b.price}`} />
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
          <div>
            <Label>Remarks</Label>
            <Textarea
              className="mt-2"
              placeholder="Remarks"
              onChange={e => setRemarks(e.target.value)}
            />
          </div>

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
