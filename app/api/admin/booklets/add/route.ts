import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { AdminJwtPayload } from "@/app/api/agent/newspapers/add/route"
// import { AdminJwtPayload } from "@/types/jwt" // path adjust

const client = new MongoClient(process.env.MONGODB_URI!)

export async function POST(req: NextRequest) {
  try {
    /* 🔐 Auth check */
    const token = (await cookies()).get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AdminJwtPayload

    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    /* 📥 Body */
    const { title, price, description, status } = await req.json()

    if (!title || !price) {
      return NextResponse.json(
        { message: "Title and price are required" },
        { status: 400 }
      )
    }

    /* 🗄️ DB */
    await client.connect()
    const db = client.db("maindatabase") // default DB
    const booklets = db.collection("booklets")

    await booklets.insertOne({
      title,
      price: Number(price),
      description: description || "",
      status: status || "active",
      created_at: new Date(),
    })

    return NextResponse.json(
      { message: "Booklet added successfully" },
      { status: 201 }
    )
  } catch (err) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}
