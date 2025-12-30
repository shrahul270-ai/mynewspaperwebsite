import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI!
const client = new MongoClient(MONGODB_URI)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Hoker ID missing" }, { status: 400 })
    }

    await client.connect()
    const db = client.db("maindatabase")
    const hokers = db.collection("hokers")

    const hoker = await hokers.findOne({ _id: new ObjectId(id) })

    if (!hoker) {
      return NextResponse.json({ error: "Hoker not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: hoker._id.toString(),
      full_name: hoker.full_name,
      mobile: hoker.mobile,
      email: hoker.email,
      agent: hoker.agent,

      address: hoker.address,
      state: hoker.state,
      district: hoker.district,
      tehsil: hoker.tehsil,
      village: hoker.village,
      pincode: hoker.pincode,

      age: hoker.age,
      gender: hoker.gender,
      photo: hoker.photo || null,
      created_at: hoker.created_at,
    })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
