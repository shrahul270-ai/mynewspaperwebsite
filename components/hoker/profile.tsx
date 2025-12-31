import { cookies } from "next/headers"
import { MongoClient, ObjectId } from "mongodb"
import jwt from "jsonwebtoken"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface HokerJwtPayload {
  hokerId: string
  role: "hoker"
}

/* ======================
   Mongo
====================== */
const client = new MongoClient(process.env.MONGODB_URI!)

export default async function HokerProfile() {
  /* ======================
     Auth
  ====================== */
  const token = (await cookies()).get("token")?.value
  if (!token) {
    return <div className="text-red-500">Unauthorized</div>
  }

  let decoded: HokerJwtPayload
  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as HokerJwtPayload
  } catch {
    return <div className="text-red-500">Invalid token</div>
  }

  /* ======================
     Fetch Hoker
  ====================== */
  await client.connect()
  const db = client.db("maindatabase")

  const hoker = await db.collection("hokers").findOne({
    _id: new ObjectId(decoded.hokerId),
  })

  if (!hoker) {
    return <div className="text-red-500">Hoker not found</div>
  }

  return (
    <div className=" space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={hoker.photo} />
            <AvatarFallback>
              {hoker.full_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div>
            <CardTitle className="text-xl">
              {hoker.full_name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Hoker Profile
            </p>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <ProfileItem label="Mobile" value={hoker.mobile} />
          <ProfileItem label="Email" value={hoker.email} />
          <ProfileItem label="Gender" value={hoker.gender} />
          <ProfileItem label="Age" value={hoker.age} />
          <ProfileItem label="Pincode" value={hoker.pincode} />

          <div className="md:col-span-2">
            <span className="text-muted-foreground">
              Address
            </span>
            <p className="mt-1">
              {hoker.address}, {hoker.village},{" "}
              {hoker.tehsil}, {hoker.district},{" "}
              {hoker.state}
            </p>
          </div>

          <div>
            <span className="text-muted-foreground">
              Status
            </span>
            <div className="mt-1">
              <Badge variant="secondary">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <div className="flex justify-end">
        <Link href="/hoker/change-password">
          <Button>Change Password</Button>
        </Link>
      </div>
    </div>
  )
}

/* ======================
   Helper
====================== */
function ProfileItem({
  label,
  value,
}: {
  label: string
  value?: string
}) {
  return (
    <div>
      <span className="text-muted-foreground">
        {label}
      </span>
      <p className="mt-1">{value || "-"}</p>
    </div>
  )
}
