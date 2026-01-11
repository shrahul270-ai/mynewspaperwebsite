import { ReactNode } from "react"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { MongoClient, ObjectId } from "mongodb"
import CustomerDashboardClient from "./dashboardclient"

interface JwtPayload {
  customerId: string
  role: string
}

const client = new MongoClient(process.env.MONGODB_URI!)

export default async function CustomerLayout({
  children,
}: {
  children: ReactNode
}) {
  const token = (await cookies()).get("token")?.value
  if (!token) return <div>Unauthorized</div>

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET!
  ) as JwtPayload

  if (decoded.role !== "customer") return <div>Forbidden</div>

  await client.connect()
  const db = client.db("maindatabase")

  const customer = await db.collection("customers").findOne({
    _id: new ObjectId(decoded.customerId),
  })

  if (!customer) return <div>Not found</div>

  return (
    <CustomerDashboardClient
      fullName={`${customer.name} ${customer.surname}`}
      photo={customer.photo}
      initials={`${customer.name[0]}${customer.surname[0]}`}
      email={customer.email}
    >
      {children}
    </CustomerDashboardClient>
  )
}
