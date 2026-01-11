"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface Props {
  customerId: string
}

export default function CustomerDetailsDialog({ customerId }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState<any>(null)

  useEffect(() => {
    if (!open) return

    const fetchCustomer = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/agent/customer-details/${customerId}`
        )
        const data = await res.json()
        setCustomer(data.customer)
      } catch {
        alert("Failed to load customer details")
      } finally {
        setLoading(false)
      }
    }

    fetchCustomer()
  }, [open, customerId])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          Details
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>

        {loading && (
          <p className="text-sm text-muted-foreground">
            Loading...
          </p>
        )}

        {!loading && customer && (
          <div className="space-y-4 text-sm">
            {/* PHOTO */}
            {customer.photo && (
              <div className="relative w-full h-56 rounded-md overflow-hidden">
                <Image
                  src={customer.photo}
                  alt={customer.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <b>Name:</b> {customer.name} {customer.surname}
              </div>
              <div>
                <b>Mobile:</b> {customer.mobile}
              </div>
              <div>
                <b>Email:</b> {customer.email}
              </div>
              <div>
                <b>Gender:</b>{" "}
                <Badge variant="outline">{customer.gender}</Badge>
              </div>
              <div>
                <b>Age:</b> {customer.age}
              </div>
              <div>
                <b>Pincode:</b> {customer.pincode}
              </div>
            </div>

            <div>
              <b>Address:</b>
              <p className="text-muted-foreground">
                {customer.address}, {customer.village},{" "}
                {customer.tehsil}, {customer.district},{" "}
                {customer.state}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
