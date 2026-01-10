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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

  const [selectedDelivery, setSelectedDelivery] =
    useState<Delivery | null>(null)

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

  /* ================= HELPERS ================= */

  const totalNewspapers = (n?: { qty?: number }[]) =>
    Array.isArray(n)
      ? n.reduce((sum, i) => sum + Number(i?.qty || 0), 0)
      : 0

  const totalBooklets = (b?: { qty?: number }[]) =>
    Array.isArray(b)
      ? b.reduce((sum, i) => sum + Number(i?.qty || 0), 0)
      : 0

  const handlePrint = () => window.print()

  /* ================= UI ================= */

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* ================= GUIDE ================= */}
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>📢 डिलीवरी की जानकारी</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>👉 किसी भी डिलीवरी पर क्लिक करने से पूरी जानकारी दिखाई देगी।</p>
          <p>👉 हर पंक्ति एक दिन की डिलीवरी को दर्शाती है।</p>
          <p>👉 Print Report बटन से पूरी सूची प्रिंट की जा सकती है।</p>
        </CardContent>
      </Card>

      {/* ================= TABLE ================= */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>📦 All Deliveries</CardTitle>
          <Button onClick={handlePrint} className="w-full sm:w-auto">
            🖨 Print Report
          </Button>
        </CardHeader>

        <CardContent>
          {deliveries.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              No deliveries found.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[900px]">
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
                    <TableRow
                      key={d._id}
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => setSelectedDelivery(d)}
                    >
                      <TableCell>
                        {d.date
                          ? new Date(d.date).toLocaleDateString()
                          : "-"}
                      </TableCell>

                      <TableCell>{d.customerName || "-"}</TableCell>
                      <TableCell>{d.hokerName || "-"}</TableCell>
                      <TableCell>{totalNewspapers(d.newspapers)}</TableCell>
                      <TableCell>{totalBooklets(d.booklets)}</TableCell>
                      <TableCell>{d.extra?.qty || 0}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {d.remarks || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ================= DETAILS DIALOG ================= */}
      <Dialog
        open={!!selectedDelivery}
        onOpenChange={() => setSelectedDelivery(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>📄 डिलीवरी विवरण</DialogTitle>
          </DialogHeader>

          {selectedDelivery && (
            <div className="space-y-2 text-sm">
              <p><b>तारीख:</b> {new Date(selectedDelivery.date).toLocaleDateString()}</p>
              <p><b>ग्राहक:</b> {selectedDelivery.customerName}</p>
              <p><b>हॉकर:</b> {selectedDelivery.hokerName}</p>
              <p><b>अख़बार:</b> {totalNewspapers(selectedDelivery.newspapers)}</p>
              <p><b>पुस्तिका:</b> {totalBooklets(selectedDelivery.booklets)}</p>
              <p><b>अतिरिक्त:</b> {selectedDelivery.extra?.qty || 0}</p>
              <p><b>टिप्पणी:</b> {selectedDelivery.remarks || "कोई नहीं"}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= PRINT STYLE ================= */}
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
