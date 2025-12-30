import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const client = new MongoClient(process.env.MONGODB_URI!)

interface AgentJwtPayload {
  agentId: string
  role: "agent"
}

export async function POST(req: NextRequest) {
  try {
    /* 🔐 Auth */
    const token = (await cookies()).get("token")?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AgentJwtPayload

    const agentId = decoded.agentId

    /* 📥 Body */
    const { billId } = await req.json()

    if (!billId) {
      return NextResponse.json(
        { success: false, message: "billId required" },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db("maindatabase")
    const bills = db.collection("generated_bills")

    /* ✅ Update bill (agent verification included) */
    const result = await bills.findOneAndUpdate(
      {
        _id: new ObjectId(billId),
        agentId: new ObjectId(agentId),
        status: { $ne: "paid" }, // already paid block
      },
      {
        $set: {
          status: "paid",
          paid_at: new Date(),
        },
      },
      {
        returnDocument: "after",
      }
    )

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Bill not found or already paid" ,billId},
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      bill: result?.value,
    })
  } catch (error) {
    console.error("Mark Bill Paid Error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
