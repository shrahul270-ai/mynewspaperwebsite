"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface Item {
  _id: string
  name?: string
  title?: string
}

export default function CustomerAllPapersPage() {
  const [newspapers, setNewspapers] = useState<Item[]>([])
  const [booklets, setBooklets] = useState<Item[]>([])

  const [selectedNewspapers, setSelectedNewspapers] = useState<string[]>([])
  const [selectedBooklets, setSelectedBooklets] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/customers/newspapers")
        const data = await res.json()

        setNewspapers(data.newspapers || [])
        setBooklets(data.booklets || [])
        setSelectedNewspapers(data.selectedNewspapers || [])
        setSelectedBooklets(data.selectedBooklets || [])
      } catch (err) {
        console.error("डेटा लाने में त्रुटि", err)
      }
    }

    fetchData()
  }, [])

  const filterSelected = (items: Item[], selected: string[]) =>
    items.filter((item) => selected.includes(item._id))

  const myNewspapers = filterSelected(newspapers, selectedNewspapers)
  const myBooklets = filterSelected(booklets, selectedBooklets)

  return (
    <div className="p-6 space-y-6">

      {/* ================= निर्देश ================= */}
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>📢 आवश्यक जानकारी</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            👉 इस पृष्ठ पर आपके द्वारा चुने गए समाचार पत्र और पुस्तिकाएँ दिखाई जाती हैं।
          </p>
          <p>
            👉 यदि आप समाचार पत्र या पुस्तिका जोड़ना या हटाना चाहते हैं,
            तो नीचे दिए गए <b>“समाचार पत्र जोड़ें / बदलें”</b> बटन पर क्लिक करें।
          </p>
          <p>
            👉 यहाँ जो सूची दिखाई दे रही है, वही आपके घर पर वितरण के लिए मानी जाएगी।
          </p>
        </CardContent>
      </Card>

      {/* ================= बटन ================= */}
      <div className="flex justify-end">
        <Link href="/customer/add-newspaper">
          <Button className="font-semibold">
            ➕ समाचार पत्र जोड़ें / बदलें
          </Button>
        </Link>
      </div>

      {/* ================= समाचार पत्र ================= */}
      <Card>
        <CardHeader>
          <CardTitle>📰 आपके समाचार पत्र</CardTitle>
        </CardHeader>
        <CardContent>
          {myNewspapers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              ❌ अभी कोई समाचार पत्र नहीं चुना गया है।
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>क्रम संख्या</TableHead>
                  <TableHead>समाचार पत्र का नाम</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myNewspapers.map((item, index) => (
                  <TableRow key={item._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.name || "नाम उपलब्ध नहीं"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ================= पुस्तिकाएँ ================= */}
      <Card>
        <CardHeader>
          <CardTitle>📘 आपकी पुस्तिकाएँ</CardTitle>
        </CardHeader>
        <CardContent>
          {myBooklets.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              ❌ अभी कोई पुस्तिका नहीं चुनी गई है।
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>क्रम संख्या</TableHead>
                  <TableHead>पुस्तिका का नाम</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myBooklets.map((item, index) => (
                  <TableRow key={item._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {item.title || item.name || "नाम उपलब्ध नहीं"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
