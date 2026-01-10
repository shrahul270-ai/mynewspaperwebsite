'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

interface BillItem {
  type: "newspaper" | "booklet"
  name: string
  price: number
  qty: number
  amount: number
}

interface Bill {
  _id: string
  month: number
  year: number
  items: BillItem[]
  totalAmount: number
  status: "paid" | "unpaid" | "pending"
  generated_at: string
}

export default function CustomerBillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/customers/bills")
      .then(res => res.json())
      .then(data => {
        setBills(data.bills || [])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="p-6">Loading bills...</div>
  }

  return (
    <div className="p-6 space-y-6">

      {/* ================= HINDI INSTRUCTIONS ================= */}
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>📢 बिल से जुड़ी जानकारी</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            👉 इस पृष्ठ पर आपके हर महीने के बिल दिखाए जाते हैं।
          </p>
          <p>
            👉 हर बिल में आपके लिए आए हुए समाचार पत्र और पुस्तिकाओं का हिसाब दिया गया है।
          </p>
          <p>
            👉 <b>Paid</b> का मतलब है कि बिल का भुगतान हो चुका है।
          </p>
          <p>
            👉 <b>Unpaid</b> या <b>Pending</b> का मतलब है कि बिल अभी बाकी है।
          </p>
          <p>
            👉 अगर बिल बाकी है, तो नीचे दिए गए <b>“Pay Now”</b> बटन से भुगतान करें।
          </p>
        </CardContent>
      </Card>

      {/* ================= PAGE TITLE ================= */}
      <h1 className="text-2xl font-bold">My Bills</h1>

      {bills.length === 0 && (
        <p className="text-muted-foreground">
          No bills available
        </p>
      )}

      {bills.map(bill => (
        <Card key={bill._id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {bill.month}/{bill.year}
            </CardTitle>

            <Badge
              className={
                bill.status === "paid"
                  ? "bg-green-500 text-white"
                  : bill.status === "pending"
                    ? "bg-yellow-500 text-black"
                    : "bg-red-500 text-white"
              }
            >
              {bill.status.toUpperCase()}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Items */}
            {bill.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between text-sm"
              >
                <span>
                  {item.name} × {item.qty}
                </span>
                <span>₹{item.amount}</span>
              </div>
            ))}

            <Separator />

            {/* Total */}
            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span>₹{bill.totalAmount}</span>
            </div>

            {/* Pay Button */}
            {(bill.status === "unpaid" || bill.status === "pending") && (
              <Button className="w-full">
                <Link href={`/customer/pay/${bill._id}`}>
                  Pay Now
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
