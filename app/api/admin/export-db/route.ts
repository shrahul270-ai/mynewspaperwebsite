import { MongoClient } from "mongodb"
import { NextResponse } from "next/server"
import * as jwt from "jsonwebtoken"
import { cookies } from "next/headers"

interface AdminJwtPayload {
  adminId: string
  role: "admin"
}

export async function GET() {
  try {
    /* ================= AUTH CHECK ================= */

    const cookieStore = await cookies()
    
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    let decoded: AdminJwtPayload

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as AdminJwtPayload
    } catch {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }

    if (decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    /* ================= DB BACKUP ================= */

    const client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()

    const db = client.db("maindatabase")
    const collections = await db.collections()

    const data: Record<string, any[]> = {}

    for (const col of collections) {
      data[col.collectionName] = await col
        .find(
          {},
          {
            projection: {
              password: 0,
              token: 0,
            },
          }
        )
        .toArray()
    }

    await client.close()

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition":
          "attachment; filename=database.json",
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}
