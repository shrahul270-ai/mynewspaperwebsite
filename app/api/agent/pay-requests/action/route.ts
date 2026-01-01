import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const client = new MongoClient(process.env.MONGODB_URI!)

interface AgentJwtPayload {
  agentId: string
  role: "agent"
}

export async function POST(req: NextRequest) {
  try {
    /* 🔐 AUTH */
    const token = (await cookies()).get("token")?.value
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AgentJwtPayload

    if (decoded.role !== "agent") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { requestId, action } = await req.json()

    if (!requestId || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { message: "Invalid request" },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db("maindatabase")

    const payCol = db.collection("pay_requests")
    const billsCol = db.collection("generated_bills")

    const payRequest = await payCol.findOne({
      _id: new ObjectId(requestId),
      agentId: new ObjectId(decoded.agentId),
    })

    if (!payRequest) {
      return NextResponse.json(
        { message: "Pay request not found" },
        { status: 404 }
      )
    }

    /* =====================
       ACCEPT
    ===================== */
    if (action === "accept") {
      // 1️⃣ Bill mark as paid
      await billsCol.updateOne(
        { _id: payRequest.billId },
        {
          $set: {
            status: "paid",
            paidAmount: payRequest.amount,
            paidAt: new Date(),
          },
        }
      )

      // 2️⃣ Remove pay request
      await payCol.deleteOne({ _id: payRequest._id })

      return NextResponse.json({
        message: "Payment accepted & bill marked as paid",
      })
    }

    /* =====================
       REJECT
    ===================== */
    await payCol.deleteOne({ _id: payRequest._id })

    return NextResponse.json({
      message: "Payment request rejected",
    })
  } catch (err) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}
