"use client"

import { useEffect, useState } from "react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

interface PayRequest {
  _id: string
  status: string
  requestedAt: string
  amount: number

  billId: string
  period: string
  billStatus: string

  customerName: string
  customerMobile: string
  customerAddress: string
  totalAmount: number
}

export default function AgentPayRequestsPage() {
  const [requests, setRequests] = useState<PayRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  /* =====================
     Fetch Pay Requests
  ===================== */
  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/agent/pay-requests")
      if (!res.ok) throw new Error()

      const data = await res.json()
      setRequests(data)
    } catch {
      alert("Failed to load pay requests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  /* =====================
     Accept / Reject Handler
  ===================== */
  const handleAction = async (
    requestId: string,
    action: "accept" | "reject"
  ) => {
    const msg =
      action === "accept"
        ? "Accept payment and mark bill as paid?"
        : "Reject this payment request?"

    if (!confirm(msg)) return

    setActionLoading(requestId)

    try {
      const res = await fetch("/api/agent/pay-requests/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          action,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      // remove request from list instantly (no reload)
      setRequests((prev) =>
        prev.filter((r) => r._id !== requestId)
      )
    } catch (err: any) {
      alert(err.message || "Action failed")
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return <div className="p-6">Loading pay requests...</div>
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">
        Payment Requests
      </h1>

      {requests.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No payment requests found
          </CardContent>
        </Card>
      )}

      {requests.map((req) => (
        <Card key={req._id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{req.customerName}</span>

              <Badge variant="destructive">
                {req.status.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-2 text-sm">
            <p>
              <b>Mobile:</b> {req.customerMobile}
            </p>
            <p>
              <b>Address:</b> {req.customerAddress}
            </p>

            <Separator />

            <p>
              <b>Bill Period:</b> {req.period}
            </p>
            <p>
              <b>Bill Amount:</b> ₹{req.totalAmount}
            </p>

            <p>
              <b>Requested On:</b>{" "}
              {new Date(req.requestedAt).toLocaleString()}
            </p>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 pt-3">
              <Button
                className="flex-1"
                disabled={actionLoading === req._id}
                onClick={() =>
                  handleAction(req._id, "accept")
                }
              >
                {actionLoading === req._id
                  ? "Processing..."
                  : "Accept"}
              </Button>

              <Button
                variant="destructive"
                className="flex-1"
                disabled={actionLoading === req._id}
                onClick={() =>
                  handleAction(req._id, "reject")
                }
              >
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
