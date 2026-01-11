import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { MongoClient, ObjectId } from "mongodb"
import { AgentJwtPayload } from "@/lib/models"

const client = new MongoClient(process.env.MONGODB_URI!)

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    /* 🔐 AUTH */
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      )
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AgentJwtPayload

    const agentId = decoded.agentId

    /* 🆔 PARAM */
    const { customerId } = await params
    const customerObjectId = new ObjectId(customerId)

    await client.connect()
    const db = client.db("maindatabase")

    const allotCol = db.collection("allotedcustomers")
    const custCol = db.collection("customers")

    /* ✅ Verify customer belongs to this agent */
    const allotment = await allotCol.findOne({
      agent: new ObjectId(agentId),
      customer: customerObjectId,
    })

    if (!allotment) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      )
    }

    /* 👤 Fetch customer details */
    const customer = await custCol.findOne(
      { _id: customerObjectId },
      {
        projection: {
          password: 0, // ❌ never send password
        },
      }
    )

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      customer,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}
