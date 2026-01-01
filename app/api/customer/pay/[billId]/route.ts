import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const client = new MongoClient(process.env.MONGODB_URI!)

interface CustomerJwtPayload {
  customerId: string
  role: "customer"
}

/* =========================
   GET : Bill Details
========================= */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ billId: string }> }
) {
  try {
    const { billId } = await params

    const token = (await cookies()).get("token")?.value
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as CustomerJwtPayload

    await client.connect()
    const db = client.db("maindatabase")

    const bill = await db.collection("generated_bills").findOne({
      _id: new ObjectId(billId),
      customerId: new ObjectId(decoded.customerId),
    })

    if (!bill) {
      return NextResponse.json(
        { message: "Bill not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(bill)
  } catch {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}
/* =========================
   PUT : Create Pay Request
========================= */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ billId: string }> }
) {
  try {
    const { billId } = await params

    const token = (await cookies()).get("token")?.value
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as CustomerJwtPayload

    await client.connect()
    const db = client.db("maindatabase")

    const billsCol = db.collection("generated_bills")
    const payCol = db.collection("pay_requests")

    const bill = await billsCol.findOne({
      _id: new ObjectId(billId),
      customerId: new ObjectId(decoded.customerId),
    })

    if (!bill) {
      return NextResponse.json(
        { message: "Bill not found" },
        { status: 404 }
      )
    }

    /* 🚫 Duplicate pending request */
    const exists = await payCol.findOne({
      billId: bill._id,
      status: "pending",
    })

    if (exists) {
      return NextResponse.json(
        { message: "Payment request already sent" },
        { status: 400 }
      )
    }

    await payCol.insertOne({
      billId: bill._id,
      customerId: bill.customerId,
      agentId: bill.agentId,
      amount: bill.totalAmount,
      status: "pending",
      requestedAt: new Date(),
      collectedAt: null,
    })

    return NextResponse.json({
      message: "Agent will contact you for payment collection",
    })
  } catch {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}
