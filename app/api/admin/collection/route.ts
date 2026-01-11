// /api/admin/collection/route.ts
import { MongoClient } from "mongodb"
import { NextResponse } from "next/server"

const MAX_LIMIT = 500 // 🔒 safety cap

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const name = searchParams.get("name")
  const limitParam = Number(searchParams.get("limit")) || 50

  if (!name) {
    return NextResponse.json(
      { error: "Collection name required" },
      { status: 400 }
    )
  }

  const limit = Math.min(limitParam, MAX_LIMIT)

  const client = new MongoClient(process.env.MONGODB_URI!)
  await client.connect()

  const db = client.db("maindatabase")
  const data = await db
    .collection(name)
    .find({})
    .sort({ _id: -1 }) // ✅ latest first
    .limit(limit)
    .toArray()

  await client.close()

  return NextResponse.json({
    limit,
    count: data.length,
    data,
  })
}
