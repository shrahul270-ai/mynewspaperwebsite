'use client'
import { ReactNode, useEffect, useState } from "react"
import NextTopLoader from 'nextjs-toploader';
import {
  LayoutDashboard,
  Users,
  UserCog,
  CreditCard,
  FileText,
  Truck,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Search,
  Newspaper,
  DollarSign
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link";

interface AgentLayoutProps {
  children: ReactNode
}

const menuItems = [
  // { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/agent/dashboard" },
  { id: "profile", label: "Profile", icon: UserCog, href: "/agent/profile" },
  { id: "customers", label: "Customers", icon: Users, badge: "", href: "/agent/customers" },
  { id: "hockers", label: "Hockers", icon: Users, badge: "", href: "/agent/hockers" },
  // { id: "hocker-payments", label: "Hocker Payments", icon: CreditCard, badge: "", href: "/agent/hocker-payments" },
  { id: "all-bills", label: "All Bills", icon: FileText, badge: "", href: "/agent/bills" },
  { id: "deliveries", label: "Deliveries", icon: Truck, badge: "", href: "/agent/deliveries" },
  { id: "newspapers", label: "Newspapers", icon: Newspaper, badge: "", href: "/agent/newspapers" },
  { id: "pay-requests", label: "Pay Requests", icon: DollarSign, badge: "", href: "/agent/pay-requests" },


]

export default function AgentLayout({ children }: AgentLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [pendingBillsCount,setpendingBillsCount] = useState<number>(0)
  const [activehokerscount,setactivehokerscount] = useState<number>(0)


  const handleMenuClick = (href: string) => {
    router.push(href)
    setMobileMenuOpen(false)
  }

  
  interface DasbhoardFetch{"pendingBills":number,"totalHokers":number}

  async function FetchInfo(){
   const info = await fetch("/api/agent/dashboard") 
   const json = (await info.json()) as DasbhoardFetch
   setpendingBillsCount(json.pendingBills)
   setactivehokerscount(json.totalHokers)



  } 


  useEffect(()=>{
    FetchInfo()
  },[])

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/20 to-background">

      {/* ===== Topbar (Mobile & Desktop) ===== */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          {/* Mobile Menu Button & Logo */}
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  {mobileMenuOpen ? <X /> : <Menu />}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <MobileSidebar
                  activeMenu={activeMenu}
                  onMenuClick={handleMenuClick}
                />
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="font-bold text-primary">A</span>
              </div>
              <h1 className="font-bold text-lg hidden md:block">
                Agent Panel
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">

        {/* ===== Desktop Sidebar ===== */}
        <aside className="w-64 bg-background border-r hidden md:flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="font-bold text-primary text-xl">A</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">Agent Panel</h1>
                <p className="text-xs text-muted-foreground">Welcome back!</p>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="p-4 border-b">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="font-bold text-lg">{activehokerscount}</p>
                <p className="text-xs text-muted-foreground">Hockers</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="font-bold text-lg">{pendingBillsCount}</p>
                <p className="text-xs text-muted-foreground">Bills</p>
              </div>
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3"
                  onClick={() => handleMenuClick(item.href)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.badge && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "ml-auto",
                        activeMenu === item.id && "bg-primary text-primary-foreground"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              )
            })}
          </nav>

          {/* Quick Actions */}
          <div className="p-4 border-t">
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Quick Actions</h3>
            <div className="space-y-2">
              <Button size="sm" className="w-full" variant="outline" onClick={()=>router.push("/agent/add-customer")}>
                New Customer
              </Button>
              <Link href={"/agent/genrate-bill"}>
              <Button size="sm" className="w-full" variant="outline">
                Create Bill
              </Button>
              </Link>
            </div>
          </div>

          {/* Logout */}
          <div className="p-4 border-t">
            <a href="/api/signout/">
            <Button variant="destructive" className="w-full gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
            </a>
          </div>
        </aside>

        {/* ===== Main Content ===== */}
        <main className="flex-1 flex flex-col min-h-[calc(100vh-4rem)]">

          {/* Breadcrumb & Actions */}
          <div className="bg-muted/40 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 pb-4">
              <div>
                <h1 className="font-bold text-2xl">Agent Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Welcome back! Here`&lsquo;s what`&lsquo;s happening today.
                </p>
              </div>
              <div className="flex gap-2 mt-4 sm:mt-0">
                
                <Link href ="/agent/add-delivery">
                <Button size="sm">
                  New Delivery
                </Button>
                </Link>
              </div>
            </div>

            {/* Mobile Search */}
            {/* <div className="px-6 pb-4 md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9"
                />
              </div>
            </div> */}
          </div>

          {/* Page Content */}
          <section className="flex-1 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              <NextTopLoader />
              {children}
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t p-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
              <p>© 2024 Agent Panel. All rights reserved.</p>
              <p className="mt-2 md:mt-0">Last login: Today, 09:42 AM</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}

// Mobile Sidebar Component
function MobileSidebar({
  activeMenu,
  onMenuClick
}: {
  activeMenu: string
  onMenuClick: (id: string) => void
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="h-16 flex items-center px-6 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="font-bold text-primary text-xl">A</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">Agent Panel</h1>
            <p className="text-xs text-muted-foreground">Mobile View</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeMenu === item.id ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => onMenuClick(item.id)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {item.badge && (
                <Badge variant="outline" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Button>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <Button variant="destructive" className="w-full gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}