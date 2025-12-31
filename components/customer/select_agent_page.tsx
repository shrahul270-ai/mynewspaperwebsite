"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Phone, MapPin } from "lucide-react"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

interface Agent {
  _id: string
  full_name: string
  mobile: string
  agency_name: string
  address: string
  photo?: string
}

export default function CustomerSelectAgentPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  /* =====================
     Fetch Agents
  ===================== */
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch("/api/customer/select-agent")
        const data = await res.json()
        setAgents(data.agents || [])
      } catch {
        toast.error("Failed to load agents")
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
  }, [])

  /* =====================
     Allot Agent
  ===================== */
  const handleSelectAgent = async (agentId: string) => {
    if (selectedAgent) return

    setSubmitting(true)

    try {
      const res = await fetch("/api/customer/select-agent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          // customerId JWT/cookie se backend me
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message || "Unable to allot agent")
        setSubmitting(false)
        return
      }

      setSelectedAgent(agentId)
      toast.success("Agent allotted successfully")
      router.push("/customer/agents")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  /* =====================
     Loading UI
  ===================== */
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[220px] rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Select Your Agent</h1>
        <p className="text-muted-foreground text-sm">
          You can select only one newspaper agent
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const isSelected = selectedAgent === agent._id

          return (
            <Card
              key={agent._id}
              className={`relative transition ${
                isSelected ? "border-green-500" : ""
              }`}
            >
              {isSelected && (
                <Badge className="absolute top-2 right-2">
                  Selected
                </Badge>
              )}

              <CardHeader className="flex flex-row gap-4 items-center">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={agent.photo} />
                  <AvatarFallback>
                    {agent.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <CardTitle className="text-base">
                    {agent.full_name}
                  </CardTitle>
                  <CardDescription>
                    {agent.agency_name}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Phone size={14} />
                  {agent.mobile}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  {agent.address}
                </div>

                <Button
                  className="w-full mt-3"
                  disabled={!!selectedAgent || submitting}
                  variant={isSelected ? "secondary" : "default"}
                  onClick={() => handleSelectAgent(agent._id)}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Selected
                    </>
                  ) : (
                    "Select Agent"
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
