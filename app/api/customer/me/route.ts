import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { MongoClient, ObjectId } from "mongodb"

interface CustomerJwtPayload {
  customerId: string
  role: string
}

const client = new MongoClient(process.env.MONGODB_URI!)

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as CustomerJwtPayload

    if (decoded.role !== "customer") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await client.connect()
    const db = client.db("maindatabase")

    const customer = await db.collection("customers").findOne({
      _id: new ObjectId(decoded.customerId),
    })

    if (!customer) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (err) {
    return NextResponse.json(
      { message: "Invalid token" },
      { status: 401 }
    )
  }
}
