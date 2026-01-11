"use client"

import Link from "next/link"
import { ReactNode } from "react"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  User,
  Calendar,
  FileText,
  CreditCard,
  Users,
  ChevronRight,
  LogOut,
  Menu,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/toggle_mode"

interface Props {
  children: ReactNode
  fullName: string
  photo?: string
  initials: string
  email: string
}

export default function CustomerDashboardClient({
  children,
  fullName,
  photo,
  initials,
  email,
}: Props) {
  return (
    <div
      className="
        min-h-screen flex
        bg-gradient-to-br
        from-gray-50 to-gray-100
        dark:from-gray-950 dark:to-gray-900
      "
    >
      {/* ================= MOBILE HEADER ================= */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="p-0 w-72">
              <Sidebar
                fullName={fullName}
                photo={photo}
                initials={initials}
                email={email}
              />
            </SheetContent>
          </Sheet>

          <span className="font-semibold">Customer Dashboard</span>
          <ModeToggle />
        </div>
      </div>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden lg:flex w-64">
        <Sidebar
          fullName={fullName}
          photo={photo}
          initials={initials}
          email={email}
        />
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 pt-16 lg:pt-6 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="rounded-2xl shadow-lg border  bg-transparent">
            <CardContent className="p-6 lg:p-8">
              {children}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

/* ================= SIDEBAR ================= */

function Sidebar({
  fullName,
  photo,
  initials,
  email,
}: {
  fullName: string
  photo?: string
  initials: string
  email: string
}) {
  const pathname = usePathname()

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-gray-100 flex items-center justify-center text-white dark:text-black">
          <LayoutDashboard />
        </div>
        <div>
          <h2 className="font-bold">Portal</h2>
          <p className="text-xs text-muted-foreground">Customer</p>
        </div>
      </div>

      {/* Profile */}
      <div className="p-5 border-b flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={photo} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm">{fullName}</p>
          <Badge variant="secondary" className="text-xs">
            {email.slice(0, 14)}...
          </Badge>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        <NavItem
          href="/customer/profile"
          icon={<User className="h-4 w-4" />}
          label="My Profile"
          active={pathname === "/customer/profile"}
        />
        <NavItem
          href="/customer/calendar"
          icon={<Calendar className="h-4 w-4" />}
          label="Calendar"
          active={pathname === "/customer/calendar"}
        />
        <NavItem
          href="/customer/bills"
          icon={<CreditCard className="h-4 w-4" />}
          label="Bills"
          active={pathname === "/customer/bills"}
        />
        <NavItem
          href="/customer/papers"
          icon={<FileText className="h-4 w-4" />}
          label="Papers"
          active={pathname === "/customer/papers"}
        />
        <NavItem
          href="/customer/agents"
          icon={<Users className="h-4 w-4" />}
          label="Agents"
          active={pathname === "/customer/agents"}
        />
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t space-y-2">
        <ModeToggle />
        <a href="/api/signout">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </a>
      </div>
    </div>
  )
}

/* ================= NAV ITEM ================= */

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string
  icon: ReactNode
  label: string
  active?: boolean
}) {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className={`
          w-full justify-start gap-3 rounded-xl transition-all
          ${
            active
              ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }
        `}
      >
        {icon}
        {label}
        {active && (
          <ChevronRight className="ml-auto h-4 w-4 opacity-70" />
        )}
      </Button>
    </Link>
  )
}
