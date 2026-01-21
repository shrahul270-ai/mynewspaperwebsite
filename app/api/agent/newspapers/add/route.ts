import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import * as jwt from "jsonwebtoken"

export interface AdminJwtPayload {
  adminId: string
  role: string
}

const client = new MongoClient(process.env.MONGODB_URI!)

export async function POST(req: NextRequest) {
  try {
    /* 🔐 AUTH */
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AdminJwtPayload

    if (!decoded?.adminId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    /* 📦 BODY */
    const { name, language, price } = await req.json()

    if (!name || !language || !price) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
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
          { success: false, message: `Price missing for ${day}` },
          { status: 400 }
        )
      }
    }

    /* 🗄 DB */
    await client.connect()
    const db = client.db("maindatabase")
    const newspapers = db.collection("newspapers")

    await newspapers.insertOne({
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
      created_at: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Newspaper added successfully",
    })
  } catch (error) {
    console.error("Add newspaper error:", error)

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
