import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"

const client = new MongoClient(process.env.MONGODB_URI!)

/* =========================
   GET : Fetch Alloted Customer
========================= */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params   // ✅ FIX

    await client.connect()
    const db = client.db("maindatabase")
    const collection = db.collection("allotedcustomers")

    const data = await collection.findOne({
      customer: new ObjectId(id),
    })

    if (!data) {
      return NextResponse.json(
        { message: "Alloted customer not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}

/* =========================
   PUT : Update Alloted Customer
========================= */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params   // ✅ FIX
    const body = await req.json()

    const {
      PB,
      BH,
      HT,
      TIMES,
      HINDU,
      is_active,
    } = body

    await client.connect()
    const db = client.db("maindatabase")
    const collection = db.collection("allotedcustomers")

    const result = await collection.updateOne(
      { customer: new ObjectId(id) },
      {
        $set: {
          PB: Number(PB),
          BH: Number(BH),
          HT: Number(HT),
          TIMES: Number(TIMES),
          HINDU: Number(HINDU),
          is_active: Boolean(is_active),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Alloted customer not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Alloted customer updated successfully",
    })
  } catch (err) {
    return NextResponse.json(
      { message: "Update failed" },
      { status: 500 }
    )
  }
}
