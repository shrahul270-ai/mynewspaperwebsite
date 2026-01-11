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

    const allotCol = db.collection("allotedcustomers")
    const custCol = db.collection("customers")

    /* 🔗 Allotted customers */
    const allotments = await allotCol
      .find({
        agent: new ObjectId(agentId),
        is_active: true,
      })
      .toArray()

    const customerIds = allotments.map(a => a.customer)

    if (customerIds.length === 0) {
      return NextResponse.json({
        success: true,
        customers: [],
      })
    }

    /* 👤 Customers */
    const customers = await custCol
      .find(
        { _id: { $in: customerIds } },
        {
          projection: {
            name: 1,
            surname: 1,
            email:1,
            mobile:1
          },
        }
      )
      .sort({ name: 1 })
      .toArray()

    return NextResponse.json({
      success: true,
      customers,
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
