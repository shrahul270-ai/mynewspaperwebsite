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

export async function POST(req: NextRequest) {
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

    const { customerId, month, year } = await req.json()
    if (!customerId || !month || !year) {
      return NextResponse.json(
        { success: false, message: "Missing data" },
        { status: 400 }
      )
    }

    client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
    const db = client.db("maindatabase")

    const billsCol = db.collection("generated_bills")
    const deliveriesCol = db.collection("hokerDeliveries")
    const allottedCol = db.collection("allotedcustomers")
    const custCol = db.collection("customers")
    const newspaperCol = db.collection("newspapers")

    /* ✅ Check allotment */
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

    /* ❌ Duplicate bill check */
    const already = await billsCol.findOne({
      agentId: new ObjectId(agentId),
      customerId: new ObjectId(customerId),
      month,
      year,
    })

    if (already)
      return NextResponse.json({
        success: false,
        message: "Bill already generated for this month",
      })

    /* 📅 Date range */
    const from = new Date(year, month - 1, 1)
    const to = new Date(year, month, 1)

    const deliveries = await deliveriesCol.find({
      agentId: new ObjectId(agentId),
      customerId: new ObjectId(customerId),
      date: { $gte: from, $lt: to },
    }).toArray()

    if (!deliveries.length)
      return NextResponse.json({
        success: false,
        message: "No deliveries found for this month",
      })

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
              priceBreakup: { [dayKey]: priceForDay },
              amount: qty * priceForDay,
            })
          }
        }
      }

      /* 📘 Booklets (unchanged) */
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

    const result = await billsCol.insertOne({
      agentId: new ObjectId(agentId),
      customerId: new ObjectId(customerId),

      customerName: `${customer.name || ""} ${customer.surname || ""}`.trim(),
      customerMobile: customer.mobile,
      customerAddress: customer.address,

      month,
      year,
      period: `${month}-${year}`,
      items,
      totalAmount,
      totalDeliveries: deliveries.length,

      status: "pending",
      paidAmount: 0,
      paidAt: null,

      generated_at: new Date(),
    })

    return NextResponse.json({
      success: true,
      billId: result.insertedId,
      totalAmount,
      itemsCount: items.length,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false }, { status: 500 })
  } finally {
    if (client) await client.close()
  }
}
