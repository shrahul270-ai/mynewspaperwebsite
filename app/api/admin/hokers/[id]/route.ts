import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const client = new MongoClient(process.env.MONGODB_URI!)

interface AdminJwtPayload {
  adminId: string
  role: "admin"
}

/* ================= AUTH HELPER ================= */

async function verifyAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) return { error: "Unauthorized", status: 401 }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AdminJwtPayload

    if (decoded.role !== "admin") {
      return { error: "Forbidden", status: 403 }
    }

    return { decoded }
  } catch {
    return { error: "Invalid token", status: 401 }
  }
}

/* ================= GET ================= */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin()
  if ("error" in auth) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    )
  }

  try {
    const { id } = await params   // ✅ FIX HERE

    await client.connect()
    const db = client.db("maindatabase")
    const hokersCol = db.collection("hokers")

    const hoker = await hokersCol.findOne({
      _id: new ObjectId(id),
    })

    if (!hoker) {
      return NextResponse.json(
        { success: false, message: "Hoker not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: hoker,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}

/* ================= PUT ================= */

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin()
  if ("error" in auth) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    )
  }

  try {
    const { id } = await params   // ✅ FIX HERE
    const body = await req.json()

    const {
      full_name,
      email,
      mobile,
      address,
      state,
      district,
      tehsil,
      village,
      pincode,
      age,
      gender,
    } = body

    await client.connect()
    const db = client.db("maindatabase")
    const hokersCol = db.collection("hokers")

    const result = await hokersCol.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          full_name,
          email,
          mobile,
          address,
          state,
          district,
          tehsil,
          village,
          pincode,
          age,
          gender,
          updated_at: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Hoker not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Hoker updated successfully",
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}


/* ================= DELETE ================= */

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin()
  if ("error" in auth) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    )
  }

  try {
    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid hoker id" },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db("maindatabase")
    const hokersCol = db.collection("hokers")

    const result = await hokersCol.deleteOne({
      _id: new ObjectId(id),
    })

    if (!result.deletedCount) {
      return NextResponse.json(
        { success: false, message: "Hoker not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Hoker deleted successfully",
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
