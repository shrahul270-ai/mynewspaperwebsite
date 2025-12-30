import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { MongoClient, ObjectId } from "mongodb"
import { AgentJwtPayload } from "@/lib/models"

export async function POST(request: NextRequest) {
  let client: MongoClient | null = null

  try {
    /* 🔐 AUTH */
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      )
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AgentJwtPayload

    const agentId = decoded.agentId
    if (!agentId) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 403 }
      )
    }

    /* 📦 BODY */
    const {
      customerId,
      hokerId,
      date,
      newspapers = [],
      booklets = [],
      extra,
      remarks,
    } = await request.json()

    if (!customerId || !hokerId || !date) {
      return NextResponse.json(
        { success: false, message: "customerId, hokerId and date are required" },
        { status: 400 }
      )
    }

    /* 🗄 DB */
    client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
    const db = client.db("maindatabase")

    const deliveriesCol = db.collection("hokerDeliveries")
    const allotmentsCol = db.collection("allotedcustomers")
    const newspapersCol = db.collection("newspapers")
    const bookletsCol = db.collection("booklets")

    /* 🔒 ALLOTMENT CHECK */
    const isAllotted = await allotmentsCol.findOne({
      agent: new ObjectId(agentId),
      customer: new ObjectId(customerId),
      is_active: true,
    })

    if (!isAllotted) {
      return NextResponse.json(
        { success: false, message: "Customer not allotted to agent" },
        { status: 403 }
      )
    }

    /* 🗞 FETCH NEWSPAPERS SNAPSHOT */
    const newspaperIds = newspapers.map(
      (n: any) => new ObjectId(n.newspaperId)
    )

    const newspaperDocs = await newspapersCol
      .find({ _id: { $in: newspaperIds } })
      .toArray()

    const finalNewspapers = newspapers.map((n: any) => {
      const doc = newspaperDocs.find(d =>
        d._id.equals(new ObjectId(n.newspaperId))
      )

      return {
        newspaperId: new ObjectId(n.newspaperId),
        name: doc?.name || "",
        language: doc?.language || "",
        price: Number(doc?.price ?? n.price),
        qty: Number(n.qty),
      }
    })

    /* 📘 FETCH BOOKLETS SNAPSHOT */
    const bookletIds = booklets.map(
      (b: any) => new ObjectId(b.bookletId)
    )

    const bookletDocs = await bookletsCol
      .find({ _id: { $in: bookletIds } })
      .toArray()

    const finalBooklets = booklets.map((b: any) => {
      const doc = bookletDocs.find(d =>
        d._id.equals(new ObjectId(b.bookletId))
      )

      return {
        bookletId: new ObjectId(b.bookletId),
        title: doc?.title || "",
        price: Number(doc?.price ?? b.price),
        qty: Number(b.qty),
      }
    })

    /* 🧾 FINAL DELIVERY DOC (HokerDelivery) */
    const deliveryDoc = {
      customerId: new ObjectId(customerId),
      hokerId: new ObjectId(hokerId),
      agentId: new ObjectId(agentId),

      date: new Date(date),

      newspapers: finalNewspapers,
      booklets: finalBooklets,

      extra: extra
        ? {
            reason: String(extra.reason || ""),
            qty: Number(extra.qty),
            price:
              extra.price !== undefined
                ? Number(extra.price)
                : undefined,
          }
        : undefined,

      remarks: remarks ? String(remarks) : undefined,
      created_at: new Date(),
    }

    /* 💾 SAVE */
    const result = await deliveriesCol.insertOne(deliveryDoc)

    return NextResponse.json({
      success: true,
      message: "Delivery saved successfully",
      deliveryId: result.insertedId,
    })
  } catch (error) {
    console.error("CREATE DELIVERY ERROR:", error)
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    )
  } finally {
    if (client) await client.close()
  }
}
