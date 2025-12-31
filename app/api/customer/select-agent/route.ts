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
export async function GET() {
  try {
    await client.connect()
    const db = client.db("maindatabase")

    const agents = await db
      .collection("agents")
      .find({ }) // optional filter
      .project({
        password_hash: 0,
      })
      .toArray()

    return NextResponse.json({ agents })
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch agents" },
      { status: 500 }
    )
  }
}

/* ======================
   PUT → Allot Agent
====================== */
export async function PUT(req: NextRequest) {
  try {
    const {  agentId } = await req.json()
    const token = req.cookies.get("token")?.value
    if(!token){
      return NextResponse.json({success:false,message:"Unautorized"},{status:403})
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET!) as CustomerJwtPayload
    const customerId = decoded.customerId;


    if (!customerId || !agentId) {
      return NextResponse.json(
        { message: "customerId & agentId required" },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db("maindatabase")
    const allotCol = db.collection("allotedcustomers")

    /* 🔒 Rule: One customer → One agent */
    const alreadyAllotted = await allotCol.findOne({
      customer: new ObjectId(customerId),
      is_active: true,
    })

    if (alreadyAllotted) {
      return NextResponse.json(
        { message: "Customer already allotted to an agent" },
        { status: 409 }
      )
    }

    /* ✅ Allot Agent */
    await allotCol.insertOne({
      agent: new ObjectId(agentId),
      customer: new ObjectId(customerId),

      // default quantities
      PB: 0,
      BH: 0,
      HT: 0,
      TIMES: 0,
      HINDU: 0,

      is_active: true,
      allotted_on: new Date(),
    })

    return NextResponse.json({
      message: "Agent allotted successfully",
    })
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to allot agent" },
      { status: 500 }
    )
  }
}
