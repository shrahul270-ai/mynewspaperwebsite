"use client"

import Link from "next/link"
import { ReactNode } from "react"
import { usePathname } from "next/navigation"
import {
  Newspaper,
  BookOpen,
  PlusSquare,
  Users,
  User,
  Database,
  LogOut,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

/* ================= TYPES ================= */

type NavLinkItem = {
  type?: never
  href: string
  label: string
  icon: LucideIcon
}

type NavSeparator = {
  type: "separator"
}

type NavItem = NavLinkItem | NavSeparator

/* ================= DATA ================= */

const navLinks: NavItem[] = [
  { href: "/admin/newspapers", label: "Newspapers", icon: Newspaper },
  { href: "/admin/add-newspaper", label: "Add Newspaper", icon: PlusSquare },

  { href: "/admin/booklets", label: "Booklets", icon: BookOpen },
  { href: "/admin/add-booklet", label: "Add Booklet", icon: PlusSquare },

  { type: "separator" },

  { href: "/admin/agents", label: "Agents", icon: Users },
  { href: "/admin/customers", label: "Customers", icon: User },
  { href: "/admin/hokers", label: "Hokers", icon: User },

  { type: "separator" },

  { href: "/admin/db", label: "Database", icon: Database },
]

/* ================= COMPONENT ================= */

export default function AdminLayoutClient({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-muted/40 to-muted/70">
      {/* =============== Sidebar =============== */}
      <aside className="w-72 bg-background/80 backdrop-blur border-r flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b">
          <h1 className="text-xl font-bold tracking-tight">
            Admin Panel
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Newspaper Management System
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((item, index) => {
            if (item.type === "separator") {
              return <Separator key={index} className="my-3" />
            }

            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all",
                    isActive
                      ? "bg-primary/10 text-primary border-l-4 border-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isActive
                        ? "text-primary"
                        : "group-hover:text-foreground"
                    )}
                  />
                  <span className="font-medium">
                    {item.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <Button
            variant="destructive"
            className="w-full justify-start gap-2"
            asChild
          >
            <a href="/api/signout">
              <LogOut className="h-4 w-4" />
              Log out
            </a>
          </Button>
        </div>
      </aside>

      {/* =============== Main =============== */}
      <main className="flex-1 p-8">
        <div className="rounded-xl bg-background shadow-sm p-6 min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </main>
    </div>
  )
}
