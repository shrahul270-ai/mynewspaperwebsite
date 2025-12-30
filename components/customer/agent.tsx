'use client'

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
  User
} from "lucide-react"
import { Button } from "../ui/button"
import Link from "next/link"

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

export default function CustomerAgentPage() {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/customers/agent")
      .then(res => res.json())
      .then(data => {
        setAgent(data.agent)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading agent details...</div>
  }

  if (!agent) {
    return (
      <div className="p-6 text-muted-foreground">
        No agent assigned yet
      </div>
    )
  }

  return (
    <div className="p-6 ">
      <Card className="overflow-hidden bg-transparent">
        {/* 🔹 Header */}
        <CardHeader className="bg-muted/50 flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={agent.photo} />
            <AvatarFallback className="text-lg">
              <User />
            </AvatarFallback>
          </Avatar>

          <div>
            <CardTitle className="text-xl">
              {agent.full_name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Agent • {agent.agency_name}
            </p>
          </div>
          <div className="flex items-center">
            <Link href={"/customer/edit-profile"}>
              <Button variant={"outline"} >Edit Profile</Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* 🔹 Contact Section */}
          <div>
            <h3 className="text-sm font-semibold mb-3">
              Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard icon={<Phone size={16} />} value={agent.mobile} />
              <InfoCard icon={<Mail size={16} />} value={agent.email} />
              <InfoCard
                icon={<Building size={16} />}
                value={agent.agency_phone}
              />
            </div>
          </div>

          <Separator />

          {/* 🔹 Address */}
          <div>
            <h3 className="text-sm font-semibold mb-3">
              Address
            </h3>

            <div className="flex gap-3 text-sm text-muted-foreground">
              <MapPin size={18} />
              <span>
                {agent.address}, {agent.village}, {agent.tehsil},
                {agent.district}, {agent.state} - {agent.pincode}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* 🔹 Small Info Card */
function InfoCard({
  icon,
  value,
}: {
  icon: React.ReactNode
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3 text-sm">
      <div className="text-muted-foreground">{icon}</div>
      <span>{value}</span>
    </div>
  )
}
