import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const MONGODB_URI = process.env.MONGODB_URI!
const JWT_SECRET = process.env.JWT_SECRET!

const client = new MongoClient(MONGODB_URI)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, mobile, password } = body

    if ((!email && !mobile) || !password) {
      return NextResponse.json(
        { success: false, message: "Email/Mobile and password required" },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db("maindatabase")
    const agents = db.collection("agents")

    const agent = await agents.findOne({
      $or: [
        email ? { email } : {},
        mobile ? { mobile } : {},
      ],
    })

    if (!agent) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      )
    }

    const isMatch = await bcrypt.compare(password, agent.password_hash)
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      )
    }

    // ✅ Create JWT
    const token = jwt.sign(
      {
        agentId: agent._id.toString(),
        role: "agent",
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    // ✅ Response + Cookie
    const response = NextResponse.json(
      {
        success: true,
        token, // (optional) frontend ke liye
        agent: {
          _id: agent._id,
          name: agent.name,
          email: agent.email,
          mobile: agent.mobile,
        },
      },
      { status: 200 }
    )

    // 🍪 Set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
