import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { MongoClient, ObjectId } from "mongodb"
import { AgentJwtPayload } from "@/lib/models"

function getDayKey(date: Date) {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ] as const

  return days[new Date(date).getDay()]
}

export async function GET(req: NextRequest) {
  let client: MongoClient | null = null

  try {
    /* 🔐 AUTH */
    const token = req.cookies.get("token")?.value
    if (!token)
      return NextResponse.json({ success: false }, { status: 403 })

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AgentJwtPayload

    const agentId = decoded.agentId

    /* 🔎 Params */
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get("customerId")
    const month = Number(searchParams.get("month"))
    const year = Number(searchParams.get("year"))

    if (!customerId || !month || !year) {
      return NextResponse.json(
        { success: false, message: "Missing params" },
        { status: 400 }
      )
    }

    client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
    const db = client.db("maindatabase")

    const deliveriesCol = db.collection("hokerDeliveries")
    const custCol = db.collection("customers")
    const billsCol = db.collection("generated_bills")
    const allottedCol = db.collection("allotedcustomers")
    const newspaperCol = db.collection("newspapers")

    /* 👤 Allotment check */
    const allottedCustomer = await allottedCol.findOne({
      agent: new ObjectId(agentId),
      customer: new ObjectId(customerId),
      is_active: true,
    })

    if (!allottedCustomer)
      return NextResponse.json(
        { success: false, message: "Customer not allotted to you" },
        { status: 403 }
      )

    /* 👤 Customer */
    const customer = await custCol.findOne({
      _id: new ObjectId(customerId),
    })

    if (!customer)
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      )

    /* 🔎 Existing bill */
    const existingBill = await billsCol.findOne({
      agentId: new ObjectId(agentId),
      customerId: new ObjectId(customerId),
      month,
      year,
    })

    /* 📅 Date range */
    const from = new Date(year, month - 1, 1)
    const to = new Date(year, month, 1)

    const deliveries = await deliveriesCol.find({
      agentId: new ObjectId(agentId),
      customerId: new ObjectId(customerId),
      date: { $gte: from, $lt: to },
    }).toArray()

    if (!deliveries.length) {
      return NextResponse.json({
        success: true,
        isGenerated: !!existingBill,
        status: existingBill?.status || "pending",
        paidAmount: existingBill?.paidAmount || 0,
        items: [],
        summary: { totalAmount: 0, totalDeliveries: 0 },
      })
    }

    /* 🧮 Aggregate */
    const itemMap = new Map<string, any>()

    for (const delivery of deliveries) {
      const dayKey = getDayKey(delivery.date)

      /* 📰 Newspapers */
      if (Array.isArray(delivery.newspapers)) {
        for (const np of delivery.newspapers) {
          const paper = await newspaperCol.findOne({
            _id: new ObjectId(np.newspaperId),
          })

          if (!paper) continue

          const priceForDay = paper.price?.[dayKey] || 0
          const qty = np.qty || 0
          const key = `newspaper_${paper._id}`

          if (itemMap.has(key)) {
            const item = itemMap.get(key)
            item.qty += qty
            item.amount += qty * priceForDay
          } else {
            itemMap.set(key, {
              type: "newspaper",
              id: paper._id,
              name: paper.name,
              language: paper.language,
              qty,
              amount: qty * priceForDay,
            })
          }
        }
      }

      /* 📘 Booklets */
      if (Array.isArray(delivery.booklets)) {
        for (const bk of delivery.booklets) {
          const key = `booklet_${bk.bookletId}`

          if (itemMap.has(key)) {
            const item = itemMap.get(key)
            item.qty += bk.qty || 0
            item.amount += (bk.qty || 0) * bk.price
          } else {
            itemMap.set(key, {
              type: "booklet",
              id: bk.bookletId,
              name: bk.title,
              qty: bk.qty || 0,
              price: bk.price,
              amount: (bk.qty || 0) * bk.price,
            })
          }
        }
      }
    }

    const items = Array.from(itemMap.values())
    const totalAmount = items.reduce((s, i) => s + i.amount, 0)

    return NextResponse.json({
      success: true,
      isGenerated: !!existingBill,
      status: existingBill?.status || "pending",
      paidAmount: existingBill?.paidAmount || 0,

      customer: {
        name: `${customer.name || ""} ${customer.surname || ""}`.trim(),
        mobile: customer.mobile,
        address: customer.address,
      },

      period: `${month}-${year}`,
      items,
      summary: {
        totalItems: items.length,
        totalAmount,
        totalDeliveries: deliveries.length,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false }, { status: 500 })
  } finally {
    if (client) await client.close()
  }
}
