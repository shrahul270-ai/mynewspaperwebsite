import CustomerAddNewspaper from "@/components/customer/add-newspaper";
import CustomerAgentPage from "@/components/customer/agent";
import CustomerBillsPage from "@/components/customer/allbills";
import CustomerCalendarPage from "@/components/customer/Calander"
import CustomerEditProfilePage from "@/components/customer/edit_profile";
import CustomerAllPapersPage from "@/components/customer/newspapers";
import CustomerProfilePage from "@/components/customer/Profile"

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: { month?: string; year?: string }
})  {
  switch ((await params).slug) {
    case "profile":
      return (
        <div className="w-full h-full">
          <CustomerProfilePage />
        </div>
      )

    case "calendar":
      return (
        <div className="w-full h-full">
          <CustomerCalendarPage searchParams={await searchParams} />
        </div>
      )

       case "add-newspaper":
      return (
        <div className="w-full h-full">
          <CustomerAddNewspaper />
        </div>
      )

        case "papers":
      return (
        <div className="w-full h-full">
          <CustomerAllPapersPage />
        </div>
      )
       case "bills":
      return (
        <div className="w-full h-full">
          <CustomerBillsPage />
        </div>
      )
       case "agents":
      return (
        <div className="w-full h-full">
          <CustomerAgentPage />
        </div>
      )
       case "edit-profile":
      return (
        <div className="w-full h-full">
          <CustomerEditProfilePage />
        </div>
      )
    default:
      return (
        <div className="p-6 text-sm text-muted-foreground">
          Page not found
        </div>
      )
  }
}
