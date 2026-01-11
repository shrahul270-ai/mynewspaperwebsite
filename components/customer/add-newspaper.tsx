"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

/* =====================
   TYPES
===================== */
interface Item {
  _id: string
  name?: string
  title?: string
}

/* =====================
   PAGE
===================== */
export default function CustomerAddNewspaper() {
  const router = useRouter()

  const [newspapers, setNewspapers] = useState<Item[]>([])
  const [booklets, setBooklets] = useState<Item[]>([])

  const [selectedNewspapers, setSelectedNewspapers] = useState<string[]>([])
  const [selectedBooklets, setSelectedBooklets] = useState<string[]>([])

  const [showIntroDialog, setShowIntroDialog] = useState(false)
  const [saving, setSaving] = useState(false)

  /* =====================
     FETCH (LIST + SAVED)
  ===================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/customers/newspapers")
        if (!res.ok) throw new Error("Fetch failed")

        const data = await res.json()

        setNewspapers(data.newspapers || [])
        setBooklets(data.booklets || [])

        setSelectedNewspapers(data.selectedNewspapers || [])
        setSelectedBooklets(data.selectedBooklets || [])

        if (
          (!data.selectedNewspapers || data.selectedNewspapers.length === 0) &&
          (!data.selectedBooklets || data.selectedBooklets.length === 0)
        ) {
          setShowIntroDialog(true)
        }
      } catch (err) {
        console.error(err)
        toast.error("डेटा लोड नहीं हो पाया")
      }
    }

    fetchData()
  }, [])

  /* =====================
     TOGGLE CHECKBOX
  ===================== */
  const toggleSelect = (
    id: string,
    type: "newspaper" | "booklet"
  ) => {
    if (type === "newspaper") {
      setSelectedNewspapers((prev) =>
        prev.includes(id)
          ? prev.filter((i) => i !== id)
          : [...prev, id]
      )
    } else {
      setSelectedBooklets((prev) =>
        prev.includes(id)
          ? prev.filter((i) => i !== id)
          : [...prev, id]
      )
    }
  }

  /* =====================
     SAVE + REDIRECT
  ===================== */
  const handleSubmit = async () => {
    if (
      selectedNewspapers.length === 0 &&
      selectedBooklets.length === 0
    ) {
      toast.warning("कृपया कम से कम एक अख़बार या बुकलेट चुनें")
      return
    }

    try {
      setSaving(true)

      const res = await fetch("/api/customers/newspapers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newspapers: selectedNewspapers,
          booklets: selectedBooklets,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message || "सेव नहीं हो पाया")
        return
      }

      toast.success("सब्सक्रिप्शन सेव हो गया 📰✅")

      // 🔁 redirect after save
      router.push("/customer/papers")
    } catch (err) {
      toast.error("कुछ गलत हो गया")
    } finally {
      setSaving(false)
    }
  }

  /* =====================
     LIST VIEW
  ===================== */
  const ListView = ({
    data,
    selected,
    type,
  }: {
    data: Item[]
    selected: string[]
    type: "newspaper" | "booklet"
  }) => (
    <div className="space-y-3">
      {data.map((item) => (
        <div
          key={item._id}
          className="flex items-center gap-3 border p-3 rounded-md"
        >
          <Checkbox
            checked={selected.includes(item._id)}
            onCheckedChange={() =>
              toggleSelect(item._id, type)
            }
          />
          <span className="text-sm font-medium">
            {item.name || item.title || "Untitled"}
          </span>
        </div>
      ))}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* =====================
         INTRO DIALOG
      ===================== */}
      <Dialog open={showIntroDialog} onOpenChange={setShowIntroDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              📰 अख़बार सब्सक्रिप्शन सिस्टम
            </DialogTitle>

            <DialogDescription className="space-y-4 text-sm leading-relaxed">
              <p>👋 <strong>स्वागत है!</strong></p>

              <p>
                🔁 यह एक <strong>सब्सक्रिप्शन आधारित सेवा</strong> है।
                जो भी आप चुनेंगे, वही आपको रोज़ घर पर मिलेगा।
              </p>

              <ul className="list-disc pl-5 space-y-2">
                <li>🗞️ चुने गए अख़बार रोज़ आएँगे</li>
                <li>📘 बुकलेट्स आपकी पसंद से जुड़ेंगी</li>
                <li>🚫 जो नहीं चुना, वह डिलीवर नहीं होगा</li>
              </ul>

              <p className="text-muted-foreground">
                🔄 आप बाद में कभी भी बदलाव कर सकते हैं
              </p>
            </DialogDescription>
          </DialogHeader>

          <Button
            className="w-full"
            onClick={() => setShowIntroDialog(false)}
          >
            ✅ समझ गया, चयन शुरू करें
          </Button>
        </DialogContent>
      </Dialog>

      {/* =====================
         MAIN CARD
      ===================== */}
      <Card>
        <CardHeader>
          <CardTitle>Select Newspapers / Booklets</CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="newspaper">
            <TabsList className="mb-4">
              <TabsTrigger value="newspaper">Newspapers</TabsTrigger>
              <TabsTrigger value="booklet">Booklets</TabsTrigger>
            </TabsList>

            <TabsContent value="newspaper">
              <ListView
                data={newspapers}
                selected={selectedNewspapers}
                type="newspaper"
              />
            </TabsContent>

            <TabsContent value="booklet">
              <ListView
                data={booklets}
                selected={selectedBooklets}
                type="booklet"
              />
            </TabsContent>
          </Tabs>

          <Button
            className="mt-6 w-full"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Selection"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
