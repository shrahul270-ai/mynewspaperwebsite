"use client"

import { useEffect, useState } from "react"
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

interface Item {
  _id: string
  name?: string
  title?: string
}

export default function CustomerAddNewspaper() {
  const [newspapers, setNewspapers] = useState<Item[]>([])
  const [booklets, setBooklets] = useState<Item[]>([])

  const [selectedNewspapers, setSelectedNewspapers] = useState<string[]>([])
  const [selectedBooklets, setSelectedBooklets] = useState<string[]>([])

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

        // ⭐ pre-selected
        setSelectedNewspapers(data.selectedNewspapers || [])
        setSelectedBooklets(data.selectedBooklets || [])
      } catch (err) {
        console.error("Fetch error:", err)
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
     SAVE
  ===================== */
  const handleSubmit = async () => {
    try {
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
        alert(data.message || "Save failed")
        return
      }

      alert("Saved successfully ✅")
    } catch (err) {
      alert("Something went wrong")
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
      <Card>
        <CardHeader>
          <CardTitle>Select Newspapers / Booklets</CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="newspaper">
            <TabsList className="mb-4">
              <TabsTrigger value="newspaper">
                Newspapers
              </TabsTrigger>
              <TabsTrigger value="booklet">
                Booklets
              </TabsTrigger>
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

          <Button className="mt-6 w-full" onClick={handleSubmit}>
            Save Selection
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
