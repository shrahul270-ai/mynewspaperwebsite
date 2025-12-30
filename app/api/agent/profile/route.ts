import { NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const client = new MongoClient(process.env.MONGODB_URI!)

interface AgentJwtPayload {
  agentId: string
  role: "agent"
}

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AgentJwtPayload

    await client.connect()
    const db = client.db("maindatabase")
    const agents = db.collection("agents")

    const agent = await agents.findOne(
      { _id: new ObjectId(decoded.agentId) },
      {
        projection: {
          password_hash: 0, // 🔒 hide password
        },
      }
    )

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    return NextResponse.json({ agent })
  } catch (err) {
    console.error("Agent GET Error", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


import { NextRequest } from "next/server"


interface AgentJwtPayload {
  agentId: string
  role: "agent"
}

export async function PUT(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AgentJwtPayload

    const body = await req.json()

    const allowedUpdates: any = {
      full_name: body.full_name,
      mobile: body.mobile,
      email: body.email,
      address: body.address,
      state: body.state,
      district: body.district,
      tehsil: body.tehsil,
      village: body.village,
      pincode: body.pincode,
      agency_name: body.agency_name,
      agency_phone: body.agency_phone,
      age: body.age,
      gender: body.gender,
      photo: body.photo,
      updated_at: new Date(), // ✅ added
    }

    // ❌ remove undefined OR empty string
    Object.keys(allowedUpdates).forEach((key) => {
      const val = allowedUpdates[key]
      if (val === undefined || val === "") {
        delete allowedUpdates[key]
      }
    })

    await client.connect()
    const db = client.db("maindatabase")
    const agents = db.collection("agents")

    const result = await agents.findOneAndUpdate(
      { _id: new ObjectId(decoded.agentId) },
      { $set: allowedUpdates },
      {
        returnDocument: "after",
        projection: { password_hash: 0 },
      }
    )

    if (!(result?.value)) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      agent: result.value,
    })
  } catch (err) {
    console.error("Agent UPDATE Error", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
