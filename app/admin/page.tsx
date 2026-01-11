"use client"

import { useEffect, useState } from "react"
import {
  CalendarDays,
  Clock,
  Coffee,
  Sun,
  Moon,
  Star,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  BellRing,
  Newspaper,
  BookOpen,
  Truck
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

/* ================= TYPES ================= */

interface DashboardData {
  agents: {
    total: number
    approved: number
    pending: number
  }
  customers: number
  hokers: number
  newspapers: number
  booklets: number
  todayDeliveries: number
}

export default function AdminDashboard() {
  const [now, setNow] = useState(new Date())
  const [data, setData] = useState<DashboardData | null>(null)

  /* ⏰ LIVE CLOCK */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  /* 📊 FETCH DASHBOARD DATA */
  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
  }, [])

  const hours = now.getHours()
  const minutes = now.getMinutes().toString().padStart(2, "0")
  const seconds = now.getSeconds()
  const ampm = hours >= 12 ? "PM" : "AM"
  const displayHours = hours % 12 || 12

  const formattedDate = now.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const getGreeting = () =>
    hours < 12 ? "Good Morning" : hours < 17 ? "Good Afternoon" : hours < 21 ? "Good Evening" : "Good Night"

  const getGreetingIcon = () =>
    hours < 6 ? <Moon /> : hours < 18 ? <Sun /> : <Star />

  if (!data) {
    return <div className="p-6">Loading dashboard...</div>
  }

  /* ================= STATS ================= */

  const stats = [
    {
      label: "Total Agents",
      value: data.agents.total,
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Customers",
      value: data.customers,
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Hokers",
      value: data.hokers,
      icon: <Truck className="h-4 w-4" />,
    },
    {
      label: "Today Deliveries",
      value: data.todayDeliveries,
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
      label: "Newspapers",
      value: data.newspapers,
      icon: <Newspaper className="h-4 w-4" />,
    },
    {
      label: "Booklets",
      value: data.booklets,
      icon: <BookOpen className="h-4 w-4" />,
    },
  ]

  return (
    <div className="min-h-screen p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {getGreetingIcon()} {getGreeting()}, Admin
          </h1>
          <p className="text-muted-foreground">{formattedDate}</p>
        </div>
        
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
                {s.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CLOCK */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" /> Live Clock (IST)
          </CardTitle>
          <CardDescription>Real-time admin dashboard clock</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-6xl font-bold">
            {displayHours}:{minutes}
            <span className="text-xl ml-2">{ampm}</span>
          </div>
          <p className="text-muted-foreground mt-2">Seconds: {seconds}</p>

          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Day Progress</span>
              <span>{Math.round((hours / 24) * 100)}%</span>
            </div>
            <Progress value={(hours / 24) * 100} />
          </div>
        </CardContent>
        <CardFooter>
          {/* <Button className="w-full">
            <Coffee className="h-4 w-4 mr-2" />
            {hours < 12 ? "Start Day" : hours < 18 ? "Continue Work" : "Review Day"}
          </Button> */}
        </CardFooter>
      </Card>

      {/* AGENT STATUS */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Status</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Badge>Approved: {data.agents.approved}</Badge>
          <Badge variant="secondary">Pending: {data.agents.pending}</Badge>
        </CardContent>
      </Card>
    </div>
  )
}
