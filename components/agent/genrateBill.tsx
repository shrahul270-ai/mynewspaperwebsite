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

interface Customer {
  _id: string
  name: string,
  surname:string,
  email:string
}

interface BillItem {
  type: string
  name: string
  price: number
  qty: number
  amount: number
}

export default function AgentGenerateBillPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerId, setCustomerId] = useState("")
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  const [items, setItems] = useState<BillItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  /* 👤 Customers */
  useEffect(() => {
    fetch("/api/agent/customers")
      .then(r => r.json())
      .then(d => setCustomers(d.customers || []))
  }, [])

  /* 🔄 Preview */
  const previewBill = async () => {
    if (!customerId) return
    setLoading(true)

    const res = await fetch(
      `/api/agent/bill/preview?customerId=${customerId}&month=${month}&year=${year}`
    )
    const data = await res.json()

    setItems(data.items || [])
    setTotal(data.summary?.totalAmount || 0)
    setLoading(false)
  }

  /* 💾 Generate */
  const generateBill = async () => {
    const res = await fetch("/api/agent/bill/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, month, year }),
    })

    const data = await res.json()
    if (data.success) {
      window.location.href = `/agent/bills/`
    } else {
      alert(data.message)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">

      <Card>
        <CardHeader>
          <CardTitle>🧾 Generate Bill</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Select onValueChange={setCustomerId}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select Customer" /></SelectTrigger>
            <SelectContent>
              {customers.map(c => (
                <SelectItem key={c._id} value={c._id}>{c.name + " : "+ c.email }</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-4">
            <input type="number" value={month} onChange={e => setMonth(+e.target.value)} />
            <input type="number" value={year} onChange={e => setYear(+e.target.value)} />
          </div>

          <Button onClick={previewBill}>Preview Bill</Button>
        </CardContent>
      </Card>

      {/* 🧾 Preview */}
      {items.length > 0 && (
        <Card>
          <CardHeader className="flex justify-between flex-row">
            <CardTitle>Bill Preview</CardTitle>
            <Button onClick={generateBill}>Generate Bill</Button>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((i, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{i.name}</TableCell>
                    <TableCell>₹{i.price}</TableCell>
                    <TableCell>{i.qty}</TableCell>
                    <TableCell>₹{i.amount}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-bold">
                    Total
                  </TableCell>
                  <TableCell className="font-bold">₹{total}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {loading && <div>Calculating...</div>}
    </div>
  )
}
