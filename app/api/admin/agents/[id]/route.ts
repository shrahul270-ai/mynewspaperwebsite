import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

/* ================= TYPES ================= */

interface AdminJwtPayload {
  adminId: string
  role: "admin"
}

/* ================= MONGO ================= */

const client = new MongoClient(process.env.MONGODB_URI!)

/* ================= AUTH ================= */

async function verifyAdmin() {
  const token = (await cookies()).get("token")?.value
  if (!token) throw new Error("Unauthorized")

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET!
  ) as AdminJwtPayload

  if (decoded.role !== "admin") throw new Error("Forbidden")
}

/* ================= GET ================= */

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin()

    const { id } = await context.params   // ✅ FIX

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid agent id" },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db("maindatabase")
    const agents = db.collection("agents")

    const agent = await agents.findOne(
      { _id: new ObjectId(id) },
      { projection: { password_hash: 0 } }
    )

    if (!agent) {
      return NextResponse.json(
        { success: false, message: "Agent not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, agent })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 401 }
    )
  }
}

/* ================= PUT ================= */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin()

    const { id } = await context.params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid agent id" },
        { status: 400 }
      )
    }

    const body = await req.json()

    // ❌ _id remove (IMPORTANT)
    delete body._id

    await client.connect()
    const db = client.db("maindatabase")
    const agents = db.collection("agents")

    const result = await agents.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...body,
          updated_at: new Date(),
        },
      }
    )

    if (!result.matchedCount) {
      return NextResponse.json(
        { success: false, message: "Agent not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Agent updated successfully",
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}


/* ================= DELETE ================= */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin()

    const { id } = await context.params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid agent id" },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db("maindatabase")
    const agents = db.collection("agents")

    const result = await agents.deleteOne({
      _id: new ObjectId(id),
    })

    if (!result.deletedCount) {
      return NextResponse.json(
        { success: false, message: "Agent not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Agent deleted successfully",
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
