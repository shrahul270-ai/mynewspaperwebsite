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

    /* 🔎 billId */
    const { searchParams } = new URL(req.url)
    const billId = searchParams.get("billId")

    if (!billId) {
      return NextResponse.json(
        { success: false, message: "billId required" },
        { status: 400 }
      )
    }

    /* 🗄 DB */
    client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
    const db = client.db("maindatabase")

    const billsCol = db.collection("generated_bills")

    /* 📦 Bill + Customer join */
    const bill = await billsCol
      .aggregate([
        {
          $match: {
            _id: new ObjectId(billId),
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
          $project: {
            _id: 1,
            month: 1,
            year: 1,
            items: 1,
            totalAmount: 1,

            /* 💰 PAYMENT INFO */
            status: 1,
            paidAmount: 1,
            paidAt: 1,

            generated_at: 1,
            customer: {
              name: "$customer.name",
              surname: "$customer.surname",
            },
          },
        },
      ])
      .toArray()

    if (!bill.length) {
      return NextResponse.json(
        { success: false, message: "Bill not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      bill: bill[0],
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
