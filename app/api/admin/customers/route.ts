import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
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

export async function GET(req: NextRequest) {
  try {
    await verifyAdmin()

    await client.connect()
    const db = client.db("maindatabase")
    const customers = db.collection("customers")

    const data = await customers
      .find({}, { projection: { password: 0 } }) // 🔒 hide password
      .sort({ created_at: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      customers: data,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 401 }
    )
  }
}
