"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/* ================= TYPES ================= */

interface BillRow {
  _id: string
  customerName: string
  month: number
  year: number
  totalAmount: number
  generated_at: string

  status: "pending" | "paid"
  paidAmount: number
}

/* ================= PAGE ================= */

export default function AgentAllBillsPage() {
  const [bills, setBills] = useState<BillRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  /* 🔗 Fetch bills */
  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await fetch("/api/agent/bill/all", {
          credentials: "include",
        })

        const data = await res.json()

        if (!data.success) {
          setError(data.message || "Failed to load bills")
          return
        }

        setBills(data.bills || [])
      } catch (err) {
        console.error(err)
        setError("Server error")
      } finally {
        setLoading(false)
      }
    }

    fetchBills()
  }, [])

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* ================= GUIDE (HINDI) ================= */}
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>📢 बिल की जानकारी</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            👉 इस पृष्ठ पर <b>एजेंट के सभी ग्राहकों के बिल</b> दिखाए जाते हैं।
          </p>
          <p>
            👉 हर पंक्ति एक ग्राहक का <b>एक महीने का बिल</b> दर्शाती है।
          </p>
          <p>
            👉 <b>Paid</b> का मतलब है कि ग्राहक ने पूरा भुगतान कर दिया है।
          </p>
          <p>
            👉 <b>Pending</b> का मतलब है कि भुगतान अभी बाकी है।
          </p>
          <p>
            👉 <b>View / Print</b> बटन से बिल की पूरी जानकारी देखी और प्रिंट की जा सकती है।
          </p>
        </CardContent>
      </Card>

      {/* ================= TABLE ================= */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>🧾 All Bills</CardTitle>
        </CardHeader>

        <CardContent>
          {bills.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              No bills generated yet
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Generated On</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {bills.map(bill => (
                    <TableRow key={bill._id}>
                      <TableCell>{bill.customerName}</TableCell>
                      <TableCell>{bill.month}</TableCell>
                      <TableCell>{bill.year}</TableCell>

                      <TableCell>₹{bill.totalAmount}</TableCell>

                      {/* STATUS */}
                      <TableCell>
                        {bill.status === "paid" ? (
                          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                            Paid
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">
                            Pending
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        {new Date(bill.generated_at).toLocaleDateString()}
                      </TableCell>

                      <TableCell className="text-right">
                        <Link href={`/agent/bill/${bill._id}`}>
                          <Button size="sm" variant="outline">
                            View / Print
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
