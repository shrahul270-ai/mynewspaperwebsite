"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  Truck,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

/* =====================
   Interfaces
===================== */
interface Agent {
  _id: string
  full_name: string
  mobile: string
  email: string
  address: string
  state: string
  district: string
  tehsil: string
  village: string
  pincode: string
  agency_name: string
  agency_phone: string
  photo?: string
}

interface Hoker {
  _id: string
  full_name: string
  mobile: string
  address: string
  state: string
  district: string
  tehsil: string
  village: string
  pincode: string
  photo?: string
}

export default function CustomerAgentPage() {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [hoker, setHoker] = useState<Hoker | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/customers/agent")
      .then(res => res.json())
      .then(data => {
        setAgent(data.agent)
        setHoker(data.hoker)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-6 text-muted-foreground">
        Loading details...
      </div>
    )
  }

  /* ❌ No Agent */
  if (!agent) {
    return (
      <div className="p-6 space-y-4 text-center">
        <p className="text-muted-foreground">
          No agent assigned yet
        </p>
        <Button asChild>
          <Link href="/customer/select-agent">
            Choose Your Agent
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">

      {/* =====================
          ⭐ HOKER (PRIMARY)
      ===================== */}
      {hoker && (
        <Card className="relative overflow-hidden border-2 border-primary bg-primary/5">
          {/* Badge */}
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
              <Star size={12} /> Primary Delivery Partner
            </span>
          </div>

          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary">
              <AvatarImage src={hoker.photo || ""} />
              <AvatarFallback>
                <Truck />
              </AvatarFallback>
            </Avatar>

            <div>
              <CardTitle className="text-lg">
                {hoker.full_name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Assigned Hoker
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <Section title="Hoker Contact">
              <InfoCard icon={<Phone size={16} />} value={hoker.mobile} />
            </Section>

            <Separator />

            <AddressBlock
              address={`${hoker.address}, ${hoker.village}, ${hoker.tehsil}, ${hoker.district}, ${hoker.state} - ${hoker.pincode}`}
            />
          </CardContent>
        </Card>
      )}

      {/* =====================
          👤 AGENT (SECONDARY)
      ===================== */}
      <Card className="overflow-hidden bg-muted/30">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={agent.photo || ""} />
            <AvatarFallback>
              <User />
            </AvatarFallback>
          </Avatar>

          <div>
            <CardTitle className="text-lg">
              {agent.full_name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Agent • {agent.agency_name}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <Section title="Agent Contact">
            <InfoCard icon={<Phone size={16} />} value={agent.mobile} />
            <InfoCard icon={<Mail size={16} />} value={agent.email} />
            <InfoCard
              icon={<Building size={16} />}
              value={agent.agency_phone}
            />
          </Section>

          <Separator />

          <AddressBlock
            address={`${agent.address}, ${agent.village}, ${agent.tehsil}, ${agent.district}, ${agent.state} - ${agent.pincode}`}
          />
        </CardContent>
      </Card>
    </div>
  )
}

/* =====================
   Reusable UI
===================== */

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  )
}

function AddressBlock({ address }: { address: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">
        Address
      </h3>
      <div className="flex gap-3 text-sm text-muted-foreground">
        <MapPin size={18} />
        <span>{address}</span>
      </div>
    </div>
  )
}

function InfoCard({
  icon,
  value,
}: {
  icon: React.ReactNode
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3 text-sm">
      <div className="text-muted-foreground">
        {icon}
      </div>
      <span>{value}</span>
    </div>
  )
}
