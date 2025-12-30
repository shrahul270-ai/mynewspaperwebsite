import Link from "next/link"
import { ReactNode } from "react"
import {
  LayoutDashboard,
  User,
  Calendar,
  FileText,
  CreditCard,
  Users,
  ChevronRight,
  LogOut,
  Settings,
  HelpCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { MongoClient, ObjectId } from "mongodb"
import { ModeToggle } from "@/components/toggle_mode"

interface CustomerJwtPayload {
  customerId: string
  role: string
}

const client = new MongoClient(process.env.MONGODB_URI!)

export default async function CustomerLayout({
  children,
}: {
  children: ReactNode
}) {
  /* 🔐 AUTH */
  const token = (await cookies()).get("token")?.value
  if (!token) return <div className="text-gray-900 dark:text-gray-100">Unauthorized</div>

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET!
  ) as CustomerJwtPayload

  if (decoded.role !== "customer") {
    return <div className="text-gray-900 dark:text-gray-100">Forbidden</div>
  }

  /* 📦 FETCH CUSTOMER */
  await client.connect()
  const db = client.db("maindatabase")

  const customer = await db.collection("customers").findOne({
    _id: new ObjectId(decoded.customerId),
  })

  if (!customer) return <div className="text-gray-900 dark:text-gray-100">Customer not found</div>

  const fullName = `${customer.name} ${customer.surname}`
  const photo = `${customer.photo}`
  const initials = `${customer.name?.[0] ?? ""}${customer.surname?.[0] ?? ""}`

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-800/30">
      {/* Modern Slim Sidebar */}
      <aside className="w-20 lg:w-64 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col transition-all duration-300 hover:shadow-xl dark:hover:shadow-gray-900/50">
        {/* Logo Section */}
        <div className="p-4 lg:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-center lg:justify-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Portal
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Customer Dashboard</p>
            </div>
          </div>
        </div>

        {/* Customer Profile - Compact */}
        <div className="p-4 lg:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col items-center lg:items-start lg:flex-row lg:space-x-3 space-y-3 lg:space-y-0">
            <div className="relative">
              <Avatar className="h-14 w-14 lg:h-12 lg:w-12 border-2 border-white dark:border-gray-800 shadow-md">
                <AvatarImage src={photo} />
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-300 font-semibold">
                  {initials.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 dark:bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <div className="hidden lg:block flex-1 text-center lg:text-left">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                {fullName}
              </h3>
              <div className="flex items-center justify-center lg:justify-start space-x-1 mt-1">
                <Badge variant="secondary" className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-600 dark:text-green-400 text-xs px-2 py-0.5">
                  Active
                </Badge>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {customer.email.length > 10
                    ? customer.email.slice(0, 10) + "..."
                    : customer.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem href="/customer/profile" label="My Profile" icon={<User className="h-4 w-4" />} />
          <SidebarItem href="/customer/calendar" label="Calendar" icon={<Calendar className="h-4 w-4" />} />
          <SidebarItem href="/customer/bills" label="My Bills" icon={<CreditCard className="h-4 w-4" />} />
          <SidebarItem href="/customer/papers" label="Papers" icon={<FileText className="h-4 w-4" />} />
          <SidebarItem href="/customer/agents" label="Agents" icon={<Users className="h-4 w-4" />} />
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-2">
          
          <Button variant="ghost" size="sm" className="w-full justify-center lg:justify-start text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800">
              <ModeToggle />
            <span className="hidden lg:inline ml-2">
              Theme
            </span>
          </Button>
          <a href="/api/signout">
            <Button variant="ghost" size="sm" className="w-full justify-center lg:justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20">
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline ml-2">Sign Out</span>
            </Button>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Card className="border-0 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/30 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
              <CardContent className="p-8 dark:text-gray-100">{children}</CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

/* Enhanced Sidebar Item */
function SidebarItem({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: ReactNode
}) {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className="w-full justify-center lg:justify-start h-12 px-3 lg:px-4 rounded-xl group transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:border-blue-200/50 dark:hover:border-blue-800/50 hover:shadow-sm dark:hover:shadow-gray-900/50"
      >
        <div className="mr-0 lg:mr-3 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
          {icon}
        </div>
        <span className="hidden lg:inline font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-300">
          {label}
        </span>
        <ChevronRight className="hidden lg:block ml-auto h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-400 dark:group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
      </Button>
    </Link>
  )
}