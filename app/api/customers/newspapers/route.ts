import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export interface CustomerJwtPayload {
  customerId: string
  role: string
}

const client = new MongoClient(process.env.MONGODB_URI!)


export async function GET() {
  try {
    /* 🔐 Auth */
    const token = (await cookies()).get("token")?.value
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as CustomerJwtPayload

    if (decoded.role !== "customer") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      )
    }

    await client.connect()
    const db = client.db("maindatabase")

    /* 📄 Master data */
    const newspapers = await db
      .collection("newspapers")
      .find({})
      .project({ name: 1 })
      .toArray()

    const booklets = await db
      .collection("booklets")
      .find({})
      .project({ title: 1 })
      .toArray()

    /* ⭐ Customer subscription */
    const subscription = await db
      .collection("customer_subscriptions")
      .findOne({
        customerId: new ObjectId(decoded.customerId),
      })

    return NextResponse.json({
      success: true,
      newspapers,
      booklets,
      selectedNewspapers:
        subscription?.newspapers?.map((id: ObjectId) =>
          id.toString()
        ) || [],
      selectedBooklets:
        subscription?.booklets?.map((id: ObjectId) =>
          id.toString()
        ) || [],
    })
  } catch (error) {
    return NextResponse.json(
      { success: false },
      { status: 500 }
    )
  }
}

/* =====================
   POST – save selection
===================== */
export async function POST(req: NextRequest) {
  try {
    /* 🔐 Auth */
    const token = (await cookies()).get("token")?.value
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as CustomerJwtPayload

    if (decoded.role !== "customer") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      )
    }

    const { newspapers, booklets } = await req.json()

    await client.connect()
    const db = client.db("maindatabase")

    await db.collection("customer_subscriptions").updateOne(
      { customerId: new ObjectId(decoded.customerId) },
      {
        $set: {
          newspapers: newspapers.map(
            (id: string) => new ObjectId(id)
          ),
          booklets: booklets.map(
            (id: string) => new ObjectId(id)
          ),
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    )

    return NextResponse.json({
      success: true,
      message: "Selection saved",
    })
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid token or data" },
      { status: 500 }
    )
  }
}
