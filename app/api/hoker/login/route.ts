import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

/* ======================
   Mongo (Native)
====================== */
const client = new MongoClient(process.env.MONGODB_URI!)

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json()
    // identifier = mobile OR email

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: "All fields required" },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db("maindatabase")
    const hokersCol = db.collection("hokers")

    /* ======================
       Find Hoker
    ====================== */
    const hoker = await hokersCol.findOne({
      $or: [{ mobile: identifier }, { email: identifier }],
    })

    if (!hoker) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      )
    }

    /* ======================
       Password Logic
    ====================== */
    let passwordMatch = false

    // 🔹 If password not set → default = 2026
    if (!hoker.password_hash) {
      passwordMatch = password === "2026"
    } else {
      passwordMatch = await bcrypt.compare(
        password,
        hoker.password_hash
      )
    }

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      )
    }

    /* ======================
       JWT
    ====================== */
    const token = jwt.sign(
      {
        hokerId: hoker._id.toString(),
        role: "hoker",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    )

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      hoker: {
        id: hoker._id,
        name: hoker.full_name,
        mobile: hoker.mobile,
      },
    })

    /* ======================
       Cookie
    ====================== */
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    )
  }
}
