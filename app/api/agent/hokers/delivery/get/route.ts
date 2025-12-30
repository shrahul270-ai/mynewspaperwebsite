import { AgentJwtPayload } from "@/lib/models"
import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { MongoClient, ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null

  try {
    /* 🔐 AUTH */
    const token = request.cookies.get("token")?.value
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
    if (!agentId) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 403 }
      )
    }

    /* ✅ id MUST be present */
    const customerId = request.nextUrl.searchParams.get("id")
    if (!customerId) {
      return NextResponse.json(
        { success: false, message: "Customer id is required" },
        { status: 400 }
      )
    }

    /* 🗄 DB */
    client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
    const db = client.db("maindatabase")

    const hokersCol = db.collection("hokers")
    const subsCol = db.collection("customer_subscriptions")
    const newspapersCol = db.collection("newspapers")
    const bookletsCol = db.collection("booklets")

    const agentObjectId = new ObjectId(agentId)
    const customerObjectId = new ObjectId(customerId)

    /* 👷‍♂️ Agent Hokers */
    const hokers = await hokersCol
      .find(
        { agent: agentObjectId },
        {
          projection: {
            full_name: 1,
            email: 1,
            mobile: 1,
          },
        }
      )
      .toArray()

    /* 📦 Customer Subscriptions */
    const subscription = await subsCol.findOne({
      customerId: customerObjectId,
    })

    if (!subscription) {
      return NextResponse.json(
        { success: false, message: "Customer subscription not found" },
        { status: 404 }
      )
    }

    /* 🗞 Newspapers */
    const newspapers = await newspapersCol
      .find({
        _id: { $in: subscription.newspapers || [] },
      })
      .toArray()

    /* 📘 Booklets */
    const booklets = await bookletsCol
      .find({
        _id: { $in: subscription.booklets || [] },
      })
      .toArray()

    /* ✅ FINAL RESPONSE */
    return NextResponse.json({
      success: true,
      newspapers,
      booklets,
      hokers,
    })
  } catch (error) {
    console.error("GET CUSTOMER DATA ERROR:", error)
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    )
  } finally {
    if (client) await client.close()
  }
}
