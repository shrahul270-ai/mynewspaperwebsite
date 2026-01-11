import { ReactNode } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  Truck,
  KeyRound,
  LogOut,
  Menu,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import jwt from "jsonwebtoken"

/* =====================
   JWT TYPE
===================== */
interface HokerJwtPayload {
  hokerId: string
  role: "hoker"
}

/* =====================
   LAYOUT
===================== */
export default async function HokerDashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  /* 🔐 AUTH CHECK */
  const token = (await cookies()).get("token")?.value

  if (!token) redirect("/login/hoker")

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as HokerJwtPayload

    if (decoded.role !== "hoker") {
      redirect("/login/hoker")
    }
  } catch {
    redirect("/login/hoker")
  }

  return (
    <div className="flex h-screen bg-muted/40 overflow-hidden">
      {/* =====================
          Desktop Sidebar
      ===================== */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background h-full">
        <div className="p-4 text-lg font-semibold border-b shrink-0">
          Hoker Dashboard
        </div>

        {/* LINKS */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <SidebarLinks />
        </nav>

        {/* LOGOUT ALWAYS VISIBLE */}
        <div className="p-3 border-t shrink-0">
          <LogoutButton />
        </div>
      </aside>

      {/* =====================
          Main Section
      ===================== */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* =====================
            Mobile Header
        ===================== */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b bg-background shrink-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="p-0 h-full overflow-y-auto"
            >
              <div className="p-4 text-lg font-semibold border-b">
                Hoker Dashboard
              </div>

              <nav className="p-3 space-y-1">
                <SidebarLinks />
              </nav>

              <div className="p-3 border-t">
                <LogoutButton />
              </div>
            </SheetContent>
          </Sheet>

          <span className="font-semibold">Dashboard</span>
        </header>

        {/* =====================
            MAIN CONTENT (SCROLLABLE)
        ===================== */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

/* =====================
   Sidebar Links
===================== */
function SidebarLinks() {
  return (
    <>
      <Link href="/hoker/dashboard">
        <Button variant="ghost" className="w-full justify-start">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Overview
        </Button>
      </Link>

      <Link href="/hoker/deliveries">
        <Button variant="ghost" className="w-full justify-start">
          <Truck className="mr-2 h-4 w-4" />
          My Deliveries
        </Button>
      </Link>

      <Link href="/hoker/change-password">
        <Button variant="ghost" className="w-full justify-start">
          <KeyRound className="mr-2 h-4 w-4" />
          Change Password
        </Button>
      </Link>
    </>
  )
}

/* =====================
   Logout Button
===================== */
function LogoutButton() {
  return (
    <form action="/api/signout" method="GET">
      <Button
        type="submit"
        variant="destructive"
        className="w-full justify-start"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </form>
  )
}
