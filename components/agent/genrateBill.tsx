"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

/* ================= TYPES ================= */

interface Customer {
  _id: string
  name: string
  surname: string
  email: string
  mobile: string
}

interface BillItem {
  type: "newspaper" | "booklet" | "extra"
  name: string
  qty: number
  amount: number
  price?: number
}

const getDisplayPrice = (item: BillItem) => {
  if (item.price) return item.price
  if (item.qty > 0) return Math.round(item.amount / item.qty)
  return "-"
}


/* ================= PAGE ================= */

export default function AgentGenerateBillPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerId, setCustomerId] = useState("")
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  const [items, setItems] = useState<BillItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [guid, setGuid] = useState("")

  const selectedCustomer = customers.find(c => c._id === customerId)

  /* 👤 Customers */
  useEffect(() => {
    fetch("/api/agent/customers")
      .then(r => r.json())
      .then(d => setCustomers(d.customers || []))
  }, [])

  /* 🔄 Preview */
  const previewBill = async () => {
    if (!customerId) return

    const newGuid = crypto.randomUUID()
    setGuid(newGuid)
    setLoading(true)

    const res = await fetch(
      `/api/agent/bill/preview?guid=${newGuid}&customerId=${customerId}&month=${month}&year=${year}`
    )

    const data = await res.json()
    setItems(data.items || [])
    setTotal(data.summary?.totalAmount || 0)
    setLoading(false)
  }

  /* 💾 Generate */
  const generateBill = async () => {
    setLoading(true)

    const res = await fetch("/api/agent/bill/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guid, customerId, month, year }),
    })

    const data = await res.json()
    setLoading(false)

    if (data.success) {
      window.location.href = "/agent/bills"
    } else {
      alert(data.message)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">

      {/* ===== Generate ===== */}
      <Card>
        <CardHeader>
          <CardTitle>🧾 बिल जनरेट करें</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Select onValueChange={setCustomerId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="ग्राहक चुनें" />
            </SelectTrigger>
            <SelectContent>
              {customers.map(c => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name} {c.surname} • {c.email} • 📞 {c.mobile}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-4">
            <input
              type="number"
              className="border rounded px-3 py-2 w-28"
              value={month}
              min={1}
              max={12}
              onChange={e => setMonth(+e.target.value)}
            />
            <input
              type="number"
              className="border rounded px-3 py-2 w-32"
              value={year}
              onChange={e => setYear(+e.target.value)}
            />
          </div>

          <Button onClick={previewBill} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            बिल प्रीव्यू देखें
          </Button>
        </CardContent>
      </Card>

      {/* ===== Preview ===== */}
      {items.length > 0 && (
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>📄 बिल पूर्वावलोकन</CardTitle>

            {/* 🔑 GUID + Customer */}
            <div className="text-sm text-muted-foreground space-y-1">
              <div>
                <span className="font-semibold ">
                  बिल आईडी (GUID):
                </span>{" "}
                {guid}
              </div>

              {selectedCustomer && (
                <div>
                  <span className="font-semibold ">ग्राहक:</span>{" "}
                  {selectedCustomer.name} {selectedCustomer.surname}
                  {" | "}
                  {selectedCustomer.email}
                  {" | 📞 "}
                  {selectedCustomer.mobile}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={generateBill} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                बिल जनरेट करें
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>आइटम</TableHead>
                  <TableHead>कीमत</TableHead>
                  <TableHead>मात्रा</TableHead>
                  <TableHead>राशि</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
  {items.map((i, idx) => (
    <TableRow key={idx}>
      <TableCell>{i.name}</TableCell>

      {/* ✅ Safe price */}
      <TableCell>
        {typeof getDisplayPrice(i) === "number"
          ? `₹${getDisplayPrice(i)}`
          : "—"}
      </TableCell>

      <TableCell>{i.qty}</TableCell>
      <TableCell>₹{i.amount}</TableCell>
    </TableRow>
  ))}

  <TableRow>
    <TableCell colSpan={3} className="text-right font-bold">
      कुल राशि
    </TableCell>
    <TableCell className="font-bold">₹{total}</TableCell>
  </TableRow>
</TableBody>

            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
