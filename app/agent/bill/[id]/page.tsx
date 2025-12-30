"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/* ================= TYPES ================= */

interface BillItem {
  type: string
  name: string
  price: number
  qty: number
  amount: number
}

interface Bill {
  _id: string
  month: number
  year: number
  totalAmount: number
  generated_at: string

  status: "pending" | "paid"
  paidAmount: number
  paidAt?: string | null

  customer: {
    name: string
    surname?: string
  }

  items: BillItem[]
}

/* ================= PAGE ================= */

export default function BillViewPage() {
  const params = useParams()
  const router = useRouter()
  const billId = params.id as string

  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [paying, setPaying] = useState(false)

  /* 🔗 Fetch bill */
  const fetchBill = async () => {
    try {
      const res = await fetch(
        `/api/agent/bill/view?billId=${billId}`,
        { credentials: "include" }
      )

      const data = await res.json()

      if (!data.success) {
        setError(data.message || "Failed to load bill")
        return
      }

      setBill(data.bill)
    } catch (err) {
      console.error(err)
      setError("Server error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBill()
  }, [billId])

  /* 💰 Mark as Paid */
  const markAsPaid = async () => {
    if (!bill) return
    setPaying(true)

    try {
      const res = await fetch("/api/agent/bill/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billId }),
      })

      const data = await res.json()

      if (!data.success) {
        alert(data.message || "Failed to mark paid")
        return
      }

      await fetchBill() // refresh bill
    } catch (err) {
      console.error(err)
      alert("Server error")
    } finally {
      setPaying(false)
    }
  }

  /* 🖨 Print */
  const handlePrint = () => {
    window.print()
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>
  if (!bill) return null

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">🧾 Bill</h1>

        <div className="flex gap-2">
          {bill.status === "pending" && (
            <Button
              onClick={markAsPaid}
              disabled={paying}
              variant="default"
            >
              {paying ? "Marking..." : "Mark as Paid"}
            </Button>
          )}

          <Button onClick={handlePrint} variant="outline">
            🖨 Print
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">

          {/* Customer + Status */}
          <div className="flex justify-between text-sm">
            <div>
              <p className="font-medium">Customer</p>
              <p>
                {bill.customer.name} {bill.customer.surname || ""}
              </p>
            </div>

            <div className="text-right space-y-1">
              <p>
                <b>Month:</b> {bill.month}/{bill.year}
              </p>

              {/* STATUS BADGE */}
              {bill.status === "paid" ? (
                <span className="inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                  Paid
                </span>
              ) : (
                <span className="inline-block px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">
                  Pending
                </span>
              )}

              <p className="text-xs text-gray-500">
                Generated on{" "}
                {new Date(bill.generated_at).toLocaleDateString()}
              </p>

              {bill.status === "paid" && bill.paidAt && (
                <p className="text-xs text-gray-500">
                  Paid on{" "}
                  {new Date(bill.paidAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Items */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {bill.items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>₹{item.price}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell className="text-right">
                    ₹{item.amount}
                  </TableCell>
                </TableRow>
              ))}

              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold">
                  ₹{bill.totalAmount}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

        </CardContent>
      </Card>

      {/* 🖨 Print styles */}
      <style jsx global>{`
        @media print {
          button {
            display: none;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  )
}
