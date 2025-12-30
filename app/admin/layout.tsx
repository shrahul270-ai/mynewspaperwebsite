import Link from "next/link"
import { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-muted">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background">
        <div className="p-6">
          <h1 className="text-xl font-semibold tracking-tight">
            Admin Panel
          </h1>
        </div>

        <Separator />

        <nav className="flex flex-col gap-1 p-4">
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/admin/newspapers">Newspapers</Link>
          </Button>

          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/admin/add-newspaper">Add Newspaper</Link>
          </Button>

          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/admin/booklets">Booklets</Link>
          </Button>

          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/admin/add-booklet">Add Booklet</Link>
          </Button>

          <Separator className="my-2" />

          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/admin/agents">Agents</Link>
          </Button>

          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/admin/customers">Customers</Link>
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
