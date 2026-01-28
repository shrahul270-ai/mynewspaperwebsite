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
    const { id } = await context.params

    const token = (await cookies()).get("token")?.value
    if (!token)
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AdminJwtPayload

    if (decoded.role !== "admin")
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      )

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
    const { id } = await context.params

    const token = (await cookies()).get("token")?.value
    if (!token)
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AdminJwtPayload

    if (decoded.role !== "admin")
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      )

    const { name, language, price } = await req.json()

    if (!name || !language || !price) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      )
    }

    const requiredDays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ]

    for (const day of requiredDays) {
      if (price[day] === undefined || price[day] === "") {
        return NextResponse.json(
          { message: `Price missing for ${day}` },
          { status: 400 }
        )
      }
    }

    await client.connect()
    const db = client.db("maindatabase")

    const result = await db.collection("newspapers").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          language,
          price: {
            monday: Number(price.monday),
            tuesday: Number(price.tuesday),
            wednesday: Number(price.wednesday),
            thursday: Number(price.thursday),
            friday: Number(price.friday),
            saturday: Number(price.saturday),
            sunday: Number(price.sunday),
          },
          updated_at: new Date(),
        },
      }
    )

    if (!result.matchedCount) {
      return NextResponse.json(
        { message: "Newspaper not found" },
        { status: 404 }
      )
    }

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


/* ======================
   DELETE : Remove Newspaper
====================== */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

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
        { message: "Invalid newspaper ID" },
        { status: 400 }
      )

    await client.connect()
    const db = client.db("maindatabase")

    // Check if newspaper exists
    const existingNewspaper = await db
      .collection("newspapers")
      .findOne({ _id: new ObjectId(id) })

    if (!existingNewspaper)
      return NextResponse.json(
        { message: "Newspaper not found" },
        { status: 404 }
      )

    // Optional: Check if newspaper has any subscriptions before deleting
    // const subscriptionCount = await db
    //   .collection("subscriptions")
    //   .countDocuments({ newspaperId: id })
    
    // if (subscriptionCount > 0) {
    //   return NextResponse.json(
    //     { 
    //       message: "Cannot delete newspaper with active subscriptions",
    //       subscriptionCount 
    //     },
    //     { status: 400 }
    //   )
    // }

    // Delete the newspaper
    const result = await db
      .collection("newspapers")
      .deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Newspaper not found or already deleted" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Newspaper deleted successfully",
      deletedId: id
    }, { status: 200 })

  } catch (error) {
    console.error("DELETE Error:", error)
    
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

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}