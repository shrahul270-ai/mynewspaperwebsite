import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const client = new MongoClient(process.env.MONGODB_URI!)

interface AdminJwtPayload {
  adminId: string
  role: "admin"
}

export async function GET(req: NextRequest) {
  try {
    /* 🔐 Admin Auth */
    const token = (await cookies()).get("token")?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AdminJwtPayload

    if (decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      )
    }

    /* 🗄️ MongoDB */
    await client.connect()
    const db = client.db("maindatabase")
    const agents = db.collection("agents")

    const data = await agents
      .find({}, { projection: { password_hash: 0 } }) // 🔒 hide password
      .sort({ created_at: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      agents: data,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
