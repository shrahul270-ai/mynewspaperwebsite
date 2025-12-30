import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { AdminJwtPayload } from "../../agent/newspapers/add/route"
// import { AdminJwtPayload } from "@/types/jwt" // path adjust kar lena

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    // 🔐 TEMP admin check (DB later)
    if (email !== process.env.ADMIN_EMAIL! || password !== process.env.ADMIN_PASSWORD!) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      )
    }

    // ✅ Payload
    const payload: AdminJwtPayload = {
      adminId: "sjdkfjaklsdjklajslkdgjlkajsld;halksjhlasjdlkfjasidjgoaj",
      role: "admin",
    }

    // 🔑 Sign JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    })

    // 🍪 Set cookie
    const response = NextResponse.json({
      message: "Login successful",
    })

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (err) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}
