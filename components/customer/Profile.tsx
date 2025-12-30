import { MongoClient, ObjectId } from "mongodb"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

/* =====================
   Types
===================== */
interface Customer {
  _id: ObjectId
  name: string
  surname: string
  mobile: string
  email: string
  address: string
  state: string
  district: string
  tehsil: string
  village: string
  pincode: string
  age: number
  gender: string
  photo?: string
  created_at: Date
}

interface CustomerJwtPayload {
  customerId: string
  role: "customer"
}

/* =====================
   Mongo
===================== */
const client = new MongoClient(process.env.MONGODB_URI!)

export default async function CustomerProfilePage() {
  /* 🔐 Auth */
  const token = (await cookies()).get("token")?.value
  if (!token) return <div>Unauthorized</div>

  let decoded: CustomerJwtPayload

  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as CustomerJwtPayload
  } catch {
    return <div>Session expired</div>
  }


  /* 🗄 DB */
  await client.connect()
  const db = client.db("maindatabase")

  const customer = await db
    .collection<Customer>("customers")
    .findOne({ _id: new ObjectId(decoded.customerId) })

  if (!customer) return <div>Customer not found</div>

  return (
    <div className="space-y-6">

      {/* ===== Header with Photo ===== */}
      <div className="flex items-center gap-5">
        <Avatar className="h-24 w-24">
          <AvatarImage src={customer.photo} />
          <AvatarFallback>
            {customer.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div>
          <h1 className="text-2xl font-semibold">
            {customer.name} {customer.surname}
          </h1>
          <p className="text-gray-500">
            Your personal information
          </p>
        </div>
      </div>

      {/* ===== Basic Info ===== */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Basic Details</CardTitle>
          <Link href="/customer/edit-profile">
            <Button size="sm">Edit Profile</Button>
          </Link>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-4">
          <Item label="Full Name">
            {customer.name} {customer.surname}
          </Item>

          <Item label="Email">{customer.email}</Item>

          <Item label="Mobile">{customer.mobile}</Item>

          <Item label="Age">{customer.age}</Item>

          <Item label="Gender">
            <Badge variant="secondary" className="capitalize">
              {customer.gender}
            </Badge>
          </Item>
        </CardContent>
      </Card>

      {/* ===== Address Info ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Address Details</CardTitle>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-4">
          <Item label="Address">{customer.address}</Item>
          <Item label="Village">{customer.village}</Item>
          <Item label="Tehsil">{customer.tehsil}</Item>
          <Item label="District">{customer.district}</Item>
          <Item label="State">{customer.state}</Item>
          <Item label="Pincode">{customer.pincode}</Item>
        </CardContent>
      </Card>
    </div>
  )
}

/* =====================
   Reusable Item
===================== */
function Item({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{children}</p>
    </div>
  )
}
