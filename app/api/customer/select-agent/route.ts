import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import * as jwt  from "jsonwebtoken"
import { CustomerJwtPayload } from "@/types/models"

/* ======================
   Mongo (Native)
====================== */
const client = new MongoClient(process.env.MONGODB_URI!)

/* ======================
   GET → All Agents
====================== */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as CustomerJwtPayload

    const customerId = decoded.customerId

    await client.connect()
    const db = client.db("maindatabase")

    /* 🔹 get customer location */
    const customer = await db.collection("customers").findOne(
      { _id: new ObjectId(customerId) },
      {
        projection: {
          pincode: 1,
          address: 1,
          village: 1,
          tehsil: 1,
          district: 1,
        },
      }
    )

    let recommended: any[] = []
    let others: any[] = []

    if (customer?.pincode) {
      /* ✅ BEST MATCH
         - same pincode
         - AND address / village / tehsil / district match
      */
      recommended = await db.collection("hokers").find({
        pincode: customer.pincode,
        $or: [
          { address: { $regex: customer.address || "", $options: "i" } },
          { village: customer.village },
          { tehsil: customer.tehsil },
          { district: customer.district },
        ],
      })
      .project({ password_hash: 0 })
      .toArray()

      /* 🔹 remaining hokers */
      const recommendedIds = recommended.map(h => h._id)

      others = await db.collection("hokers").find({
        _id: { $nin: recommendedIds },
      })
      .project({ password_hash: 0 })
      .toArray()
    } else {
      /* fallback */
      others = await db.collection("hokers")
        .find({})
        .project({ password_hash: 0 })
        .toArray()
    }

    return NextResponse.json({
      recommended,
      others,
    })
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch hokers" },
      { status: 500 }
    )
  }
}



/* ======================
   PUT → Allot Agent
====================== */
export async function PUT(req: NextRequest) {
  try {
    const { agentId, hokerId } = await req.json()

    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as CustomerJwtPayload

    const customerId = decoded.customerId

    if (!customerId || !agentId || !hokerId) {
      return NextResponse.json(
        { message: "agentId & hokerId required" },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db("maindatabase")

    const allotCol = db.collection("allotedcustomers")
    const customersCol = db.collection("customers")

    /* 🔒 One customer → One agent */
    const alreadyAllotted = await allotCol.findOne({
      customer: new ObjectId(customerId),
      is_active: true,
    })

    if (alreadyAllotted) {
      return NextResponse.json(
        { message: "Customer already allotted" },
        { status: 409 }
      )
    }

    /* ✅ Allot Agent */
    await allotCol.insertOne({
      agent: new ObjectId(agentId),
      customer: new ObjectId(customerId),

      PB: 0,
      BH: 0,
      HT: 0,
      TIMES: 0,
      HINDU: 0,

      is_active: true,
      allotted_on: new Date(),
    })

    /* ✅ Add hoker to customer */
    await customersCol.updateOne(
      { _id: new ObjectId(customerId) },
      {
        $addToSet: {
          hoker: new ObjectId(hokerId), // array auto maintain
        },
      }
    )

    return NextResponse.json({
      message: "Agent allotted & hoker added successfully",
    })
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to allot agent" },
      { status: 500 }
    )
  }
}
