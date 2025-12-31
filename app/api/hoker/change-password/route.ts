import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

interface HokerJwtPayload {
  hokerId: string
  role: "hoker"
}

/* ======================
   Mongo
====================== */
const client = new MongoClient(process.env.MONGODB_URI!)

export async function PUT(req: NextRequest) {
  try {
    const { oldPassword, newPassword, confirmPassword } =
      await req.json()

    /* ======================
       Validation
    ====================== */
    if (!oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "New password & confirm password do not match" },
        { status: 400 }
      )
    }

    /* ======================
       Auth (JWT)
    ====================== */
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    let decoded: HokerJwtPayload
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as HokerJwtPayload
    } catch {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      )
    }

    /* ======================
       Fetch Hoker
    ====================== */
    await client.connect()
    const db = client.db("maindatabase")
    const hokersCol = db.collection("hokers")

    const hoker = await hokersCol.findOne({
      _id: new ObjectId(decoded.hokerId),
    })

    if (!hoker) {
      return NextResponse.json(
        { message: "Hoker not found" },
        { status: 404 }
      )
    }

    /* ======================
       Verify Old Password
    ====================== */
    let isOldPasswordValid = false

    // 🔹 Default password case
    if (!hoker.password_hash) {
      isOldPasswordValid = oldPassword === "2026"
    } else {
      isOldPasswordValid = await bcrypt.compare(
        oldPassword,
        hoker.password_hash
      )
    }

    if (!isOldPasswordValid) {
      return NextResponse.json(
        { message: "Old password is incorrect" },
        { status: 400 }
      )
    }

    /* ======================
       Update Password
    ====================== */
    const newHash = await bcrypt.hash(newPassword, 10)

    await hokersCol.updateOne(
      { _id: new ObjectId(decoded.hokerId) },
      {
        $set: {
          password_hash: newHash,
          updated_at: new Date(),
        },
      }
    )

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to change password" },
      { status: 500 }
    )
  }
}
