import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

/* =======================
   MongoDB
======================= */
const MONGODB_URI = process.env.MONGODB_URI!
const client = new MongoClient(MONGODB_URI)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      name,
      surname,
      mobile,
      email,
      password, // ✅ password added
      address,
      state,
      district,
      tehsil,
      village,
      pincode,
      age,
      gender,
    } = body

    // ✅ Validation
    if (!name || !mobile || !email || !password || !address) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db("maindatabase")
    const customers = db.collection("customers")

    // ❌ Duplicate check
    const exists = await customers.findOne({
      $or: [{ mobile }, { email }],
    })

    if (exists) {
      return NextResponse.json(
        { success: false, message: "Customer already exists" },
        { status: 409 }
      )
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // ✅ Insert customer
    const customer = {
      name,
      surname,
      mobile,
      email,
      password: hashedPassword, // ✅ saved securely

      address,
      state,
      district,
      tehsil,
      village,
      pincode,

      age: Number(age),
      gender,

      created_at: new Date(),
    }

    const result = await customers.insertOne(customer)

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: result.insertedId,
          name,
          email,
          mobile,
        },
      },
      { status: 201 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
