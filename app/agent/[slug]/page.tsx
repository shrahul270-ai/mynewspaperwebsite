import AgentDeliveryPage from '@/components/agent/add-delevery'
import AddAgentNewspaper from '@/components/agent/Add_newspaper'
import AddAgentCustomersClient from '@/components/agent/addCustomer'
import AgentAllBillsPage from '@/components/agent/AllBills'
import CreateHoker from '@/components/agent/CreateHocker'
import AgentCustomers from '@/components/agent/Customers'
import AgentAllDeliveriesPage from '@/components/agent/DeliverysPage'
import AgentEditAllotedCustomerPage from '@/components/agent/edit-allotment'
import AgentProfilePage from '@/components/agent/edit_profile'
import AgentGenerateBillPage from '@/components/agent/genrateBill'
import AgentHokers from '@/components/agent/Hockers'
import AgentNewspapers from '@/components/agent/NewsPapers'
import AgentPayRequestsPage from '@/components/agent/pay_requests'
import AgentProfile from '@/components/agent/profile'
import { headers } from 'next/headers'
import React from 'react'


export default async function Page() {
  const headersList = await headers()
  const pathname = "/"+new URL(headersList.get("url")!).pathname.split("/").pop()
  
  console.log(pathname+" ::::::")
  console.log("------------------------------")
  const routes = [
    {
      component: AgentProfile,
      path: '/profile',
    },
    {
      component: AddAgentCustomersClient,
      path: '/addcustomer',
    },
    {
      component: AgentCustomers,
      path: '/customers',
    },
    {
      component: CreateHoker,
      path: '/add-hocker',
    },
    {
      component: AddAgentCustomersClient,
      path: '/add-customer',
    },
    {
      component: AgentHokers,
      path: '/hockers',
    },
    {
      component: AgentNewspapers,
      path: '/newspapers',
    },
      {
      component: AddAgentNewspaper,
      path: '/add-newspaper',
    },
    {
      component: AgentDeliveryPage,
      path: '/add-delivery',
    },
    {
      component: AgentAllDeliveriesPage,
      path: '/deliveries',
    },
    {
      component: AgentGenerateBillPage,
      path: '/genrate-bill',
    },
     {
      component: AgentAllBillsPage,
      path: '/bills',
    },
     {
      component: AgentProfilePage,
      path: '/edit-profile',
    },
    {
      component: AgentEditAllotedCustomerPage,
      path: '/edit-allotment',
    },
      {
      component: AgentPayRequestsPage,
      path: '/pay-requests',
    },
  ]

  const matchedRoute = routes.find(
    (item) => pathname === `${item.path}`
  )

  const SelectedComponent = matchedRoute?.component


  console.warn(headersList.get("x-invoke-path"))

  // return (
  //   <>
  //   <table></table>
  //   {headersList.forEach((value,key)=><tr>
  //     <td>{key}</td>
  //     <td>{value}</td>
  //   </tr>)}
  //   </>
  // )

  return (
    <div className="w-full h-full">
      {SelectedComponent ? (
        <SelectedComponent />
      ) : (
        <div className="p-6 text-sm text-muted-foreground">
          Page not found
        </div>
      )}
    </div>
  )
}
