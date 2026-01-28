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



/* ======================
   DELETE : Remove Booklet
====================== */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params // ✅ Next.js 15 fix

    // Token verification
    const token = (await cookies()).get("token")?.value
    if (!token)
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )

    // JWT verification
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AdminJwtPayload

    // Check if user is admin
    if (decoded.role !== "admin")
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      )

    // Validate ObjectId
    if (!ObjectId.isValid(id))
      return NextResponse.json(
        { message: "Invalid booklet ID" },
        { status: 400 }
      )

    await client.connect()
    const db = client.db("maindatabase")

    // Check if booklet exists
    const existingBooklet = await db
      .collection("booklets")
      .findOne({ _id: new ObjectId(id) })

    if (!existingBooklet)
      return NextResponse.json(
        { message: "Booklet not found" },
        { status: 404 }
      )

    // Optional: Check if booklet has any orders/transactions before deleting
    // const orderCount = await db
    //   .collection("orders")
    //   .countDocuments({ bookletId: id })
    
    // if (orderCount > 0) {
    //   return NextResponse.json(
    //     { 
    //       message: "Cannot delete booklet with existing orders",
    //       orderCount 
    //     },
    //     { status: 400 }
    //   )
    // }

    // Delete the booklet
    const result = await db
      .collection("booklets")
      .deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Booklet not found or already deleted" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Booklet deleted successfully",
      deletedId: id
    }, { status: 200 })

  } catch (error) {
    console.error("DELETE Booklet Error:", error)
    
    // Handle specific errors
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      )
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { message: "Token expired" },
        { status: 401 }
      )
    }

    // Handle MongoDB errors
    if (error instanceof Error && error.message.includes("ObjectId")) {
      return NextResponse.json(
        { message: "Invalid booklet ID format" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}