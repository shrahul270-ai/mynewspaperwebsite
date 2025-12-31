import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

/* =======================
   MongoDB
======================= */
const MONGODB_URI = process.env.MONGODB_URI!
const client = new MongoClient(MONGODB_URI)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      name,
      surname,
      mobile,
      email,
      password,
      address,
      state,
      district,
      tehsil,
      village,
      pincode,
      age,
      gender,
    } = body

    /* =======================
       Validation
    ======================= */
    if (!name || !mobile || !email || !password || !address) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db("maindatabase")
    const customers = db.collection("customers")

    /* =======================
       Duplicate Check
    ======================= */
    const exists = await customers.findOne({
      $or: [{ mobile }, { email }],
    })

    if (exists) {
      return NextResponse.json(
        { success: false, message: "Customer already exists" },
        { status: 409 }
      )
    }

    /* =======================
       Hash Password
    ======================= */
    const hashedPassword = await bcrypt.hash(password, 10)

    /* =======================
       Insert Customer
    ======================= */
    const customerDoc = {
      name,
      surname,
      mobile,
      email,
      password: hashedPassword,
      address,
      state,
      district,
      tehsil,
      village,
      pincode,
      age: Number(age),
      gender,
      created_at: new Date(),
    }

    const result = await customers.insertOne(customerDoc)

    /* =======================
       JWT Token
    ======================= */
    const token = jwt.sign(
      {
        customerId: result.insertedId.toString(),
        role: "customer",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    )

    /* =======================
       Response + Cookie
    ======================= */
    const response = NextResponse.json(
      {
        success: true,
        customer: {
          id: result.insertedId.toString(),
          email,
          name,
        },
      },
      { status: 201 }
    )

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })

    return response
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
