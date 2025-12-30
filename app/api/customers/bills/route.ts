import { NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

interface CustomerJwtPayload {
  customerId: string
  role: "customer"
}

const client = new MongoClient(process.env.MONGODB_URI!)

export async function GET() {
  try {
    /* 🔐 Auth */
    const token = (await cookies()).get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as CustomerJwtPayload

    if (decoded.role !== "customer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const customerId = decoded.customerId

    /* 🗄 DB */
    await client.connect()
    const db = client.db("maindatabase")
    const bills = db.collection("generated_bills")

    /* 📦 Fetch bills (pending → unpaid/new → paid) */
    const data = await bills
      .aggregate([
        {
          $match: {
            customerId: new ObjectId(customerId),
          },
        },
        {
          $addFields: {
            statusOrder: {
              $switch: {
                branches: [
                  { case: { $eq: ["$status", "pending"] }, then: 1 },
                  { case: { $eq: ["$status", "unpaid"] }, then: 2 },
                  { case: { $eq: ["$status", "new"] }, then: 2 },
                  { case: { $eq: ["$status", "paid"] }, then: 3 },
                ],
                default: 4,
              },
            },
          },
        },
        {
          $sort: {
            statusOrder: 1, // 🔥 priority
            year: -1,
            month: -1,
          },
        },
        {
          $project: {
            statusOrder: 0, // remove helper field
          },
        },
      ])
      .toArray()

    return NextResponse.json({
      success: true,
      bills: data,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
