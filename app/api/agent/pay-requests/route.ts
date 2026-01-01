import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const client = new MongoClient(process.env.MONGODB_URI!)

interface AgentJwtPayload {
  agentId: string
  role: "agent"
}

/* =========================
   GET : Agent Pay Requests
========================= */
export async function GET(req: NextRequest) {
  try {
    /* 🔐 AUTH */
    const token = (await cookies()).get("token")?.value
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AgentJwtPayload

    if (decoded.role !== "agent") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      )
    }

    await client.connect()
    const db = client.db("maindatabase")

    /* 🔎 Aggregate pay_requests + bill info */
    const requests = await db
      .collection("pay_requests")
      .aggregate([
        {
          $match: {
            agentId: new ObjectId(decoded.agentId),
          },
        },
        {
          $lookup: {
            from: "generated_bills",
            localField: "billId",
            foreignField: "_id",
            as: "bill",
          },
        },
        {
          $unwind: "$bill",
        },
        {
          $sort: { requestedAt: -1 },
        },
        {
          $project: {
            _id: 1,
            status: 1,
            requestedAt: 1,
            amount: 1,

            billId: "$bill._id",
            period: "$bill.period",
            billStatus: "$bill.status",

            customerName: "$bill.customerName",
            customerMobile: "$bill.customerMobile",
            customerAddress: "$bill.customerAddress",
            totalAmount: "$bill.totalAmount",
          },
        },
      ])
      .toArray()

    return NextResponse.json(requests)
  } catch (err) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}
