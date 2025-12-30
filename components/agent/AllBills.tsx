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
    <div className="p-6 space-y-4">

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>🧾 All Bills</CardTitle>
        </CardHeader>

        <CardContent>
          {bills.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No bills generated yet
            </div>
          ) : (
            <Table>
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

                    {/* 💰 STATUS */}
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
