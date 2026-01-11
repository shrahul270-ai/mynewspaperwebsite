'use client'

import { ReactNode, useEffect, useState } from "react"
import NextTopLoader from 'nextjs-toploader'
import {
  Users,
  UserCog,
  FileText,
  Truck,
  LogOut,
  Menu,
  X,
  Newspaper,
  DollarSign,
} from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"

interface AgentLayoutProps {
  children: ReactNode
}

const menuItems = [
  { id: "profile", label: "Profile", icon: UserCog, href: "/agent/profile" },
  { id: "customers", label: "Customers", icon: Users, href: "/agent/customers" },
  { id: "hockers", label: "Hockers", icon: Users, href: "/agent/hockers" },
  { id: "bills", label: "All Bills", icon: FileText, href: "/agent/bills" },
  { id: "deliveries", label: "Deliveries", icon: Truck, href: "/agent/deliveries" },
  { id: "newspapers", label: "Newspapers", icon: Newspaper, href: "/agent/newspapers" },
  { id: "pay", label: "Pay Requests", icon: DollarSign, href: "/agent/pay-requests" },
]

export default function AgentLayout({ children }: AgentLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [pendingBillsCount, setPendingBillsCount] = useState(0)
  const [activeHokersCount, setActiveHokersCount] = useState(0)

  async function fetchInfo() {
    const res = await fetch("/api/agent/dashboard")
    const json = await res.json()
    setPendingBillsCount(json.pendingBills)
    setActiveHokersCount(json.totalHokers)
  }

  useEffect(() => {
    fetchInfo()
  }, [])

  /* ================= SIDEBAR ================= */

  const Sidebar = () => (
    <aside className="w-64 bg-background border-r flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b shrink-0">
        <div>
          <h1 className="font-bold text-lg">Agent Panel</h1>
          <p className="text-xs text-muted-foreground">Welcome back</p>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 border-b shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="font-bold text-lg">{activeHokersCount}</p>
            <p className="text-xs text-muted-foreground">Hokers</p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="font-bold text-lg">{pendingBillsCount}</p>
            <p className="text-xs text-muted-foreground">Bills</p>
          </div>
        </div>
      </div>

      {/* Menu (SCROLLABLE) */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon
          const active = pathname === item.href

          return (
            <Button
              key={item.id}
              variant={active ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => router.push(item.href)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          )
        })}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t shrink-0 space-y-2">
        <Button size="sm" variant="outline" className="w-full" onClick={() => router.push("/agent/add-customer")}>
          New Customer
        </Button>
        <Button size="sm" variant="outline" className="w-full" onClick={() => router.push("/agent/genrate-bill")}>
          Create Bill
        </Button>
      </div>

      {/* Logout (ALWAYS VISIBLE) */}
      <div className="p-4 border-t shrink-0">
        <a href="/api/signout">
          <Button variant="destructive" className="w-full gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </a>
      </div>
    </aside>
  )

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-muted/20 to-background">
      <NextTopLoader />

      {/* ===== Mobile Header ===== */}
      <header className="md:hidden h-14 flex items-center justify-between px-4 border-b bg-background shrink-0">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="ghost">
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="p-0 w-64 h-full">
            <Sidebar />
          </SheetContent>
        </Sheet>

        <span className="font-semibold">Agent Panel</span>
      </header>

      <div className="flex h-[calc(100vh-3.5rem)] md:h-full">
        {/* Desktop Sidebar */}
        <div className="hidden md:block h-full">
          <Sidebar />
        </div>

        {/* ===== Main Content ===== */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="border-b bg-muted/40 shrink-0">
            <div className="p-6">
              <h1 className="font-bold text-2xl">Agent Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back! Here's what's happening today.
              </p>
            </div>
          </div>

          {/* PAGE CONTENT (SCROLLABLE) */}
          <section className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t p-4 shrink-0">
            <div className="text-sm text-muted-foreground text-center">
              © 2024 Agent Panel. All rights reserved.
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
