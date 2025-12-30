import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { AdminJwtPayload } from "../../agent/newspapers/add/route"
// import { AdminJwtPayload } from "@/types/jwt" // path adjust

const client = new MongoClient(process.env.MONGODB_URI!)

export async function GET(req: NextRequest) {
  try {
    /* 🔐 Auth */
    const token = (await cookies()).get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AdminJwtPayload

    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    /* 🗄️ DB */
    await client.connect()
    const db = client.db("maindatabase")
    const booklets = db.collection("booklets")

    const data = await booklets
      .find({})
      .sort({ created_at: -1 })
      .toArray()

    return NextResponse.json(
      { booklets: data },
      { status: 200 }
    )
  } catch (err) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}
