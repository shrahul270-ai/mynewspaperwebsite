import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const client = new MongoClient(process.env.MONGODB_URI!)

interface AdminJwtPayload {
  adminId: string
  role: "admin"
}

/* ======================
   GET : Single Newspaper
====================== */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params  // ✅ FIX

    const token = (await cookies()).get("token")?.value
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AdminJwtPayload

    if (decoded.role !== "admin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })

    await client.connect()
    const db = client.db("maindatabase")

    const newspaper = await db
      .collection("newspapers")
      .findOne({ _id: new ObjectId(id) })

    if (!newspaper)
      return NextResponse.json(
        { message: "Newspaper not found" },
        { status: 404 }
      )

    return NextResponse.json(newspaper)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

/* ======================
   PUT : Update Newspaper
====================== */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params  // ✅ FIX

    const token = (await cookies()).get("token")?.value
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AdminJwtPayload

    if (decoded.role !== "admin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })

    const { name, price, language } = await req.json()
    if (!name || !price || !language)
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      )

    await client.connect()
    const db = client.db("maindatabase")

    const result = await db.collection("newspapers").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          price: Number(price),
          language,
        },
      }
    )

    if (!result.matchedCount)
      return NextResponse.json(
        { message: "Newspaper not found" },
        { status: 404 }
      )

    return NextResponse.json({
      message: "Newspaper updated successfully",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
