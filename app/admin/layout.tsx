import Link from "next/link"
import { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import AdminLayoutClient from "./AdminLayoutClient"

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
     <AdminLayoutClient>{children}</AdminLayoutClient>
  )
}
