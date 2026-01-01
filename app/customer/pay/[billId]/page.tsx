"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface BillItem {
  type: "newspaper" | "booklet"
  name: string
  language?: string
  price: number
  qty: number
  amount: number
}

interface Bill {
  _id: string
  customerName: string
  customerMobile: string
  customerAddress: string
  period: string
  items: BillItem[]
  totalAmount: number
  status: string
}

export default function CustomerPayPage() {
  const { billId } = useParams()
  const router = useRouter()

  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)

  /* =====================
     Fetch Bill
  ===================== */
  useEffect(() => {
    if (!billId) return

    const fetchBill = async () => {
      try {
        const res = await fetch(`/api/customer/pay/${billId}`)
        if (!res.ok) throw new Error()

        const data = await res.json()
        setBill(data)
      } catch {
        alert("Failed to load bill")
        router.back()
      } finally {
        setLoading(false)
      }
    }

    fetchBill()
  }, [billId, router])

  /* =====================
     Call Agent (Pay Request)
  ===================== */
  const handlePayRequest = async () => {
    if (!billId) return
    setRequesting(true)

    try {
      const res = await fetch(`/api/customer/pay/${billId}`, {
        method: "PUT",
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      alert(data.message)
      router.back()
    } catch (err: any) {
      alert(err.message || "Request failed")
    } finally {
      setRequesting(false)
    }
  }

  if (loading) return <div className="p-6">Loading bill...</div>
  if (!bill) return null

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Bill Details
            <Badge
              variant={
                bill.status === "paid"
                  ? "default"
                  : "destructive"
              }
            >
              {bill.status.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 text-sm">
          <p><b>Name:</b> {bill.customerName}</p>
          <p><b>Mobile:</b> {bill.customerMobile}</p>
          <p><b>Address:</b> {bill.customerAddress}</p>
          <p><b>Period:</b> {bill.period}</p>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {bill.items.map((item, i) => (
            <div
              key={i}
              className="flex justify-between text-sm"
            >
              <div>
                <p className="font-medium">
                  {item.name}
                  {item.language && ` (${item.language})`}
                </p>
                <p className="text-muted-foreground">
                  ₹{item.price} × {item.qty}
                </p>
              </div>
              <p className="font-semibold">
                ₹{item.amount}
              </p>
            </div>
          ))}

          <Separator />

          <div className="flex justify-between font-semibold">
            <span>Total Amount</span>
            <span>₹{bill.totalAmount}</span>
          </div>
        </CardContent>
      </Card>

      {/* Action */}
      {bill.status !== "paid" && (
        <Button
          onClick={handlePayRequest}
          disabled={requesting}
          className="w-full"
        >
          {requesting
            ? "Requesting Agent..."
            : "Call Agent for Payment"}
        </Button>
      )}
    </div>
  )
}
