"use client"

import { useEffect, useState } from "react"
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

interface Delivery {
  _id: string
  date: string
  customerName: string
  hokerName: string
  newspapers?: { qty?: number }[]
  booklets?: { qty?: number }[]
  extra?: { qty?: number }
  remarks?: string
}

/* ================= PAGE ================= */

export default function AgentAllDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const res = await fetch("/api/agent/hokers/delivery/all", {
          credentials: "include",
        })

        const data = await res.json()

        if (!data.success) {
          setError(data.message || "Failed to load deliveries")
          return
        }

        setDeliveries(data.deliveries || [])
      } catch (err) {
        console.error(err)
        setError("Server error")
      } finally {
        setLoading(false)
      }
    }

    fetchDeliveries()
  }, [])

  /* ================= HELPERS (SAFE) ================= */

  const totalNewspapers = (n?: { qty?: number }[]) => {
    if (!Array.isArray(n)) return 0
    return n.reduce((sum, i) => sum + Number(i?.qty || 0), 0)
  }

  const totalBooklets = (b?: { qty?: number }[]) => {
    if (!Array.isArray(b)) return 0
    return b.reduce((sum, i) => sum + Number(i?.qty || 0), 0)
  }

  /* ================= PRINT ================= */

  const handlePrint = () => window.print()

  /* ================= UI ================= */

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>📦 All Deliveries</CardTitle>
          <Button onClick={handlePrint}>🖨 Print Report</Button>
        </CardHeader>

        <CardContent>
          {deliveries.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No deliveries found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Hoker</TableHead>
                  <TableHead>🗞 Newspaper</TableHead>
                  <TableHead>📘 Booklet</TableHead>
                  <TableHead>➕ Extra</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {deliveries.map(d => (
                  <TableRow key={d._id}>
                    <TableCell>
                      {d.date
                        ? new Date(d.date).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>{d.customerName || "-"}</TableCell>
                    <TableCell>{d.hokerName || "-"}</TableCell>
                    <TableCell>
                      {totalNewspapers(d.newspapers)}
                    </TableCell>
                    <TableCell>
                      {totalBooklets(d.booklets)}
                    </TableCell>
                    <TableCell>{d.extra?.qty || 0}</TableCell>
                    <TableCell>{d.remarks || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 🖨 Print CSS */}
      <style jsx global>{`
        @media print {
          button {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
