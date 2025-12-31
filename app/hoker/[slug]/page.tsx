import HokerChangePasswordPage from "@/components/hoker/change_password"
import HokerDeliveries from "@/components/hoker/deliverys"
import HokerProfile from "@/components/hoker/profile"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function HokerSlugPage({ params }: PageProps) {
  const { slug } = await params

  // 👉 dashboard = profile page
  if (slug === "dashboard") {
    return <HokerProfile />
  }

  switch (slug) {
    case "deliveries":
      return <HokerDeliveries />

    case "change-password":
      return <HokerChangePasswordPage />

    default:
      notFound()
  }
}
