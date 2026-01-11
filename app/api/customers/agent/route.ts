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
    const customers = db.collection("customers")
    const hokers = db.collection("hokers")

    /* 🔗 Find agentId from allotedcustomers */
    const allotment = await allotedCustomers.findOne({
      customer: new ObjectId(customerId),
      is_active: true,
    })

    if (!allotment) {
      return NextResponse.json({
        success: true,
        agent: null,
        hoker: null,
        message: "No agent allotted",
      })
    }

    /* 👤 Fetch agent */
    const agent = await agents.findOne(
      { _id: new ObjectId(allotment.agent) },
      { projection: { password_hash: 0 } }
    )

    /* 👤 Fetch customer (for hokerId) */
    const customer = await customers.findOne(
      { _id: new ObjectId(customerId) },
      { projection: { hoker: 1 } }
    )

    let hoker = null

    /* 🧍 Fetch hoker (if exists) */
    if (customer?.hoker && customer.hoker.length > 0) {
      hoker = await hokers.findOne(
        { _id: new ObjectId(customer.hoker[0]) },
        { projection: { password_hash: 0 } }
      )
    }

    return NextResponse.json({
      success: true,
      agent,
      hoker,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
