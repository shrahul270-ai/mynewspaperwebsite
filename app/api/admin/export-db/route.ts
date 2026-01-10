import { MongoClient } from "mongodb"
import { NextResponse } from "next/server"

export async function GET() {
  const client = new MongoClient(process.env.MONGODB_URI!)
  await client.connect()

  const db = client.db("maindatabase")
  const collections = await db.collections()

  const data: any = {}

  for (const col of collections) {
    data[col.collectionName] = await col.find({}).toArray()
  }

  await client.close()

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=database.json",
    },
  })
}
