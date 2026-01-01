import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

/* ======================
   CONFIG
====================== */
const MONGODB_URI = process.env.MONGODB_URI!
const JWT_SECRET = process.env.JWT_SECRET!

if (!MONGODB_URI || !JWT_SECRET) {
  throw new Error("Missing environment variables")
}

/* ======================
   MONGO SINGLETON
====================== */
let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (!global._mongoClientPromise) {
  client = new MongoClient(MONGODB_URI)
  global._mongoClientPromise = client.connect()
}
clientPromise = global._mongoClientPromise

/* ======================
   POST : AGENT LOGIN
====================== */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, mobile, password } = body

    /* 🔍 Validation */
    if ((!email && !mobile) || !password) {
      return NextResponse.json(
        { success: false, message: "Email or Mobile and password required" },
        { status: 400 }
      )
    }

    /* 🔗 Mongo */
    const client = await clientPromise
    const db = client.db("maindatabase")
    const agents = db.collection("agents")

    /* 🧠 SAFE QUERY (NO EMPTY OBJECT) */
    const orQuery: any[] = []
    if (email) orQuery.push({ email })
    if (mobile) orQuery.push({ mobile })

    const agent = await agents.findOne({ $or: orQuery })

    if (!agent) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      )
    }

    /* 🔐 Password check */
    const isMatch = await bcrypt.compare(
      password,
      agent.password_hash
    )

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      )
    }

    /* 🚫 STATUS CHECK */
    if (agent.status !== "approved") {
      return NextResponse.json(
        {
          success: false,
          message:
            agent.status === "pending"
              ? "Your account is under approval"
              : "Your account has been rejected",
        },
        { status: 403 }
      )
    }

    /* 🎫 JWT */
    const token = jwt.sign(
      {
        agentId: agent._id.toString(),
        role: "agent",
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    /* 🍪 RESPONSE + COOKIE */
    const response = NextResponse.json(
      {
        success: true,
        agent: {
          _id: agent._id,
          full_name: agent.full_name,
          email: agent.email,
          mobile: agent.mobile,
        },
      },
      { status: 200 }
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
    console.error("Agent login error:", err)

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
