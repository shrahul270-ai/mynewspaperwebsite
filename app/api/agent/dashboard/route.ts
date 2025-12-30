import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const client = new MongoClient(process.env.MONGODB_URI!)

interface AgentJwtPayload {
  agentId: string
  role: "agent"
}

export async function GET(req: NextRequest) {
  try {
    /* 🔐 Auth */
    const token = (await cookies()).get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AgentJwtPayload

    const agentId = decoded.agentId

    await client.connect()
    const db = client.db("maindatabase")

    // const customers = db.collection("customers")
    const hokers = db.collection("hokers")
    const generated_bills = db.collection("generated_bills")

    /* 📌 Pending Bills (Customers) */
    const pendingBillsCount = await generated_bills.countDocuments({
      agentId: new ObjectId(agentId),
      status: "pending",
    })

    /* 👥 Total Hokers */
    const totalHokers = await hokers.countDocuments({
      agent: new ObjectId(agentId),
    })

    return NextResponse.json({
      pendingBills: pendingBillsCount,
      totalHokers,
    })
  } catch (error) {
    console.error("Agent Dashboard API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
