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
   GET : Single Booklet
====================== */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params // ✅ Next.js 15 fix

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

    const booklet = await db
      .collection("booklets")
      .findOne({ _id: new ObjectId(id) })

    if (!booklet)
      return NextResponse.json(
        { message: "Booklet not found" },
        { status: 404 }
      )

    return NextResponse.json(booklet)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

/* ======================
   PUT : Update Booklet
====================== */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params // ✅ Next.js 15 fix

    const token = (await cookies()).get("token")?.value
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AdminJwtPayload

    if (decoded.role !== "admin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })

    const { title, price, description, status } = await req.json()

    if (!title || !price || !description || !status) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db("maindatabase")

    const result = await db.collection("booklets").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          price: Number(price),
          description,
          status, // active | inactive
        },
      }
    )

    if (!result.matchedCount)
      return NextResponse.json(
        { message: "Booklet not found" },
        { status: 404 }
      )

    return NextResponse.json({
      message: "Booklet updated successfully",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
