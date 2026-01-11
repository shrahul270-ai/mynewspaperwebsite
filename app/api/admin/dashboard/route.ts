import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const client = new MongoClient(process.env.MONGODB_URI!)

interface AdminJwtPayload {
  adminId: string
  role: "admin"
}

export async function GET() {
  try {
    /* 🔐 AUTH */
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

    /* 🗄 DB */
    await client.connect()
    const db = client.db("maindatabase")

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    /* 📊 COUNTS */
    const [
      totalAgents,
      approvedAgents,
      pendingAgents,
      totalCustomers,
      totalHokers,
      totalNewspapers,
      totalBooklets,
      todayDeliveries,
    ] = await Promise.all([
      db.collection("agents").countDocuments(),
      db.collection("agents").countDocuments({ status: "approved" }),
      db.collection("agents").countDocuments({ status: "pending" }),
      db.collection("customers").countDocuments(),
      db.collection("hokers").countDocuments(),
      db.collection("newspapers").countDocuments(),
      db.collection("booklets").countDocuments(),
      db.collection("hokerDeliveries").countDocuments({
        date: { $gte: today },
      }),
    ])

    return NextResponse.json({
      agents: {
        total: totalAgents,
        approved: approvedAgents,
        pending: pendingAgents,
      },
      customers: totalCustomers,
      hokers: totalHokers,
      newspapers: totalNewspapers,
      booklets: totalBooklets,
      todayDeliveries,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    )
  }
}
