import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import jwt from "jsonwebtoken"
import { AdminJwtPayload } from "../../add/route"

/* =====================
   Interfaces
===================== */


/* =====================
   MongoDB
===================== */
const client = new MongoClient(process.env.MONGODB_URI!)

/* =====================
   GET: Single Newspaper
===================== */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params // ✅ FIX

    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Agent not authorized" },
        { status: 401 }
      )
    }

    // ✅ jwt.verify is SYNC
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AdminJwtPayload

    const agentId = decoded.adminId
    if (!agentId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }
    // console.log("Agent is "+ agentId)
    await client.connect()
    const db = client.db("maindatabase")

    const newspaper = await db.collection("newspapers").findOne({
      _id: new ObjectId(id),
      // agentId:new ObjectId(agentId), // 🔒 ownership check
    })

    if (!newspaper) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: newspaper,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}

/* =====================
   PUT: Update Newspaper
===================== */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params // ✅ FIX

    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Agent not authorized" },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AdminJwtPayload

    const adminId = decoded.adminId
    if (!adminId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { name, price, language } = await req.json()

    if (!name || !price || !language) {
      return NextResponse.json(
        { success: false, message: "All fields required" },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db("maindatabase")

    const result = await db.collection("newspapers").updateOne(
      {
        _id: new ObjectId(id),
        // agentId:new ObjectId(adminId), // 🔒 ownership check
      },
      {
        $set: {
          name,
          price: Number(price),
          language,
          updated_at: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Not found or no permission" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Newspaper updated successfully",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
