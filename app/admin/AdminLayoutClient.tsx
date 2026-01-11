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
  Menu,
  type LucideIcon,
  LayoutDashboard,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
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
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },

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

  const Sidebar = () => (
    <aside className="w-72 bg-background border-r flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b shrink-0">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Newspaper Management System
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
  {navLinks.map((item, index) => {
    if (item.type === "separator") {
      return <Separator key={index} className="my-3" />
    }

    const isActive =
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(item.href)

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
          <Icon className="h-4 w-4" />
          <span className="font-medium">{item.label}</span>
        </div>
      </Link>
    )
  })}
</nav>


      {/* Logout */}
      <div className="p-4 border-t shrink-0">
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
  )

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      {/* ===== Desktop Sidebar ===== */}
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>

      {/* ===== Main Section ===== */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* ===== Mobile Header ===== */}
        <header className="md:hidden h-14 flex items-center justify-between px-4 border-b bg-background shrink-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost">
                <Menu />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="p-0 w-72 h-full"
            >
              <Sidebar />
            </SheetContent>
          </Sheet>

          <span className="font-semibold">Admin Panel</span>
        </header>

        {/* ===== Main Content (SCROLLABLE) ===== */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="rounded-xl bg-background shadow-sm p-6 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
