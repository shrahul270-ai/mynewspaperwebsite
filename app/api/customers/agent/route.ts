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

    const allotedCustomers = db.collection("allotedcustomers")
    const agents = db.collection("agents")

    /* 🔗 Find agentId from allotedcustomers */
    const allotment = await allotedCustomers.findOne({
      customer: new ObjectId(customerId),
    })

    if (!allotment) {
      return NextResponse.json({
        success: true,
        agent: null,
        message: "No agent alloted",
      })
    }

    /* 👤 Fetch agent info */
    const agent = await agents.findOne({
      _id: new ObjectId(allotment.agent),
    })

    if (!agent) {
      return NextResponse.json({
        success: true,
        agent: null,
        message: "Agent not found",
      })
    }

    return NextResponse.json({
      success: true,
      agent,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
