import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

interface AdminJwtPayload {
  adminId: string
  role: "admin"
}

const client = new MongoClient(process.env.MONGODB_URI!)

async function verifyAdmin() {
  const token = (await cookies()).get("token")?.value
  if (!token) throw new Error("Unauthorized")

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET!
  ) as AdminJwtPayload

  if (decoded.role !== "admin") throw new Error("Forbidden")
}

/* ========= GET ========= */

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin()
    const { id } = await context.params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid customer id" },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db("maindatabase")
    const customers = db.collection("customers")

    const customer = await customers.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    )

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, customer })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 401 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin()
    const { id } = await context.params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid customer id" },
        { status: 400 }
      )
    }

    const body = await req.json()

    // ❌ immutable field
    delete body._id
    delete body.password

    await client.connect()
    const db = client.db("maindatabase")
    const customers = db.collection("customers")

    const result = await customers.updateOne(
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
        { success: false, message: "Customer not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Customer updated successfully",
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}


/* ========= DELETE ========= */

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin()
    const { id } = await context.params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid customer id" },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db("maindatabase")
    const customers = db.collection("customers")

    const result = await customers.deleteOne({
      _id: new ObjectId(id),
    })

    if (!result.deletedCount) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
