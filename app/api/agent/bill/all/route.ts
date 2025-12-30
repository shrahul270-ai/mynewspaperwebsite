import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { MongoClient, ObjectId } from "mongodb"
import { AgentJwtPayload } from "@/lib/models"

export async function GET(req: NextRequest) {
  let client: MongoClient | null = null

  try {
    /* 🔐 Auth */
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      )
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AgentJwtPayload

    const agentId = decoded.agentId

    /* 🗄 DB */
    client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
    const db = client.db("maindatabase")

    const billsCol = db.collection("generated_bills")

    /* 📦 Aggregate: bill + customer */
    const bills = await billsCol
      .aggregate([
        {
          $match: {
            agentId: new ObjectId(agentId),
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "customerId",
            foreignField: "_id",
            as: "customer",
          },
        },
        { $unwind: "$customer" },
        {
          $sort: { generated_at: -1 },
        },
        {
          $project: {
            _id: 1,
            month: 1,
            year: 1,
            totalAmount: 1,

            /* 💰 PAYMENT STATUS */
            status: 1,
            paidAmount: 1,
            paidAt: 1,

            generated_at: 1,
            customerName: {
              $concat: [
                "$customer.name",
                " ",
                { $ifNull: ["$customer.surname", ""] },
              ],
            },
          },
        },
      ])
      .toArray()

    return NextResponse.json({
      success: true,
      bills,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    )
  } finally {
    if (client) await client.close()
  }
}
