import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

/* ================= CONFIG ================= */

// MongoDB
const MONGODB_URI = process.env.MONGODB_URI!
const DB_NAME = "maindatabase"

// JWT
const JWT_SECRET = process.env.JWT_SECRET!

/* ================= ROUTE ================= */

export async function POST(req: Request) {
  let client: MongoClient | null = null

  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password required" },
        { status: 400 }
      )
    }

    /* ---- MongoDB Connect ---- */
    client = new MongoClient(MONGODB_URI)
    await client.connect()

    const db = client.db(DB_NAME)
    const customers = db.collection("customers")

    /* ---- Find Customer ---- */
    const customer = await customers.findOne({ email })

    if (!customer || !customer.password) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      )
    }

    /* ---- Password Check ---- */
    const isMatch = await bcrypt.compare(password, customer.password)

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      )
    }

    /* ---- JWT Generate ---- */
    const token = jwt.sign(
      {
        customerId: customer._id.toString(),
        role: "customer",
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    /* ---- Response + Cookie ---- */
    const response = NextResponse.json(
      {
        success: true,
        token, // (optional: frontend ke liye)
        customer: {
          id: customer._id,
          email: customer.email,
          name: customer.name || "",
        },
      },
      { status: 200 }
    )

    // 🍪 HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error: any) {
    console.log(error.message)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  } finally {
    if (client) await client.close()
  }
}
