import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import * as jwt from 'jsonwebtoken'
import { AgentJwtPayload } from "@/lib/models"

const client = new MongoClient(process.env.MONGODB_URI!)

/* =========================
   GET : Alloted Customer + Hoker Info
========================= */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    /* 🔐 AUTH */
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      )
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AgentJwtPayload

    const agentId = decoded.agentId

    /* 🆔 PARAM */
    const { id } = await params
    const customerId = new ObjectId(id)

    /* 🗄 DB */
    await client.connect()
    const db = client.db("maindatabase")

    const allotCol = db.collection("allotedcustomers")
    const custCol = db.collection("customers")
    const hokerCol = db.collection("hokers")

    /* 📦 Allotment */
    const allotedCustomer = await allotCol.findOne({
      customer: customerId,
    })

    /* 👤 Customer */
    const customer = await custCol.findOne(
      { _id: customerId },
      { projection: { hoker: 1 } }
    )

    let customerHokers: any[] = []
    let availableHokers: any[] = []

    /* ✅ Customer ke assigned hokers (same agent only) */
    if (customer?.hoker?.length > 0) {
      customerHokers = await hokerCol
        .find(
          {
            _id: { $in: customer?.hoker },
            agent: new ObjectId(agentId),
          },
          {
            projection: {
              full_name: 1,
              email: 1,
              mobile: 1,
              photo: 1,
            },
          }
        )
        .toArray()
    }

    /* ✅ Agent ke SAARE hokers (ALWAYS) */
    availableHokers = await hokerCol
      .find(
        { agent: new ObjectId(agentId) },
        {
          projection: {
            full_name: 1,
            email: 1,
            mobile: 1,
            photo: 1,
          },
        }
      )
      .toArray()

    return NextResponse.json({
      allotedCustomer,
      customerHokers,   // already assigned
      availableHokers,  // agent ke saare hokers
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}

/* =========================
   PUT : Update Allotment + Assign Hoker
========================= */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    /* 🔐 AUTH */
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      )
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AgentJwtPayload

    const agentId = decoded.agentId

    /* 🆔 PARAM */
    const { id } = await params
    const customerId = new ObjectId(id)

    const body = await req.json()
    const {
      PB,
      BH,
      HT,
      TIMES,
      HINDU,
      is_active,
      hokerId,
    } = body

    await client.connect()
    const db = client.db("maindatabase")

    const allotCol = db.collection("allotedcustomers")
    const custCol = db.collection("customers")
    const hokerCol = db.collection("hokers")

    /* ✅ Validate hoker belongs to agent */
    if (hokerId) {
      const hoker = await hokerCol.findOne({
        _id: new ObjectId(hokerId),
        agent: new ObjectId(agentId),
      })

      if (!hoker) {
        return NextResponse.json(
          { message: "Invalid hoker" },
          { status: 400 }
        )
      }
    }

    /* 🧾 Update / create allotment */
    await allotCol.updateOne(
      { customer: customerId },
      {
        $set: {
          PB: Number(PB),
          BH: Number(BH),
          HT: Number(HT),
          TIMES: Number(TIMES),
          HINDU: Number(HINDU),
          is_active: Boolean(is_active),
        },
      },
      { upsert: true }
    )

    /* 👷 Assign SINGLE hoker (REPLACE array) */
    if (hokerId) {
      await custCol.updateOne(
        { _id: customerId },
        { $set: { hoker: [new ObjectId(hokerId)] } }
      )
    }

    return NextResponse.json({
      message: "Allotment & hoker updated successfully",
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { message: "Update failed" },
      { status: 500 }
    )
  }
}

/* =========================
   DELETE : Remove Allotment
========================= */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await client.connect()
    const db = client.db("maindatabase")

    const result = await db
      .collection("allotedcustomers")
      .deleteOne({ customer: new ObjectId(id) })

    if (!result.deletedCount) {
      return NextResponse.json(
        { message: "Alloted customer not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Allotment deleted successfully",
    })
  } catch (err) {
    return NextResponse.json({ message: "Delete failed" }, { status: 500 })
  }
}
