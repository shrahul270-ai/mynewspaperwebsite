import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { MongoClient, ObjectId } from "mongodb"
import { AgentJwtPayload } from "@/lib/models"

export async function GET(req: NextRequest) {
  let client: MongoClient | null = null

  try {
    /* 🔐 Auth */
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ success: false }, { status: 403 })
    }

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

    /* 🗄 DB */
    client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
    const db = client.db("maindatabase")

    const deliveriesCol = db.collection("hokerDeliveries")
    const custCol = db.collection("customers")
    const billsCol = db.collection("generated_bills")
    const allottedCol = db.collection("allotedcustomers")

    /* 👤 Check if customer is allotted to this agent */
    const allottedCustomer = await allottedCol.findOne({
      agent: new ObjectId(agentId),
      customer: new ObjectId(customerId),
      is_active: true,
    })

    if (!allottedCustomer) {
      return NextResponse.json(
        { success: false, message: "Customer not allotted to you" },
        { status: 403 }
      )
    }

    /* 👤 Get customer details */
    const customer = await custCol.findOne({
      _id: new ObjectId(customerId),
    })

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      )
    }

    /* 🔎 Already generated bill check */
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

    if (deliveries.length === 0) {
      return NextResponse.json({
        success: true,
        isGenerated: !!existingBill,
        status: existingBill?.status || "pending",
        paidAmount: existingBill?.paidAmount || 0,
        items: [],
        summary: { totalAmount: 0, totalDeliveries: 0 },
      })
    }

    /* 🧮 Aggregate items from all deliveries */
    const itemMap = new Map<string, any>() // key: type_id_name, value: item
    
    deliveries.forEach(delivery => {
      // Process newspapers array
      if (delivery.newspapers && Array.isArray(delivery.newspapers)) {
        delivery.newspapers.forEach((np: any) => {
          const key = `newspaper_${np.newspaperId.toString()}_${np.name}`
          const existingItem = itemMap.get(key)
          
          if (existingItem) {
            existingItem.qty += np.qty || 0
            existingItem.amount = existingItem.qty * existingItem.price
          } else {
            itemMap.set(key, {
              type: "newspaper",
              id: np.newspaperId,
              name: np.name,
              language: np.language,
              price: np.price,
              qty: np.qty || 0,
              amount: (np.qty || 0) * np.price,
            })
          }
        })
      }

      // Process booklets array
      if (delivery.booklets && Array.isArray(delivery.booklets)) {
        delivery.booklets.forEach((bk: any) => {
          const key = `booklet_${bk.bookletId.toString()}_${bk.title}`
          const existingItem = itemMap.get(key)
          
          if (existingItem) {
            existingItem.qty += bk.qty || 0
            existingItem.amount = existingItem.qty * existingItem.price
          } else {
            itemMap.set(key, {
              type: "booklet",
              id: bk.bookletId,
              name: bk.title,
              price: bk.price,
              qty: bk.qty || 0,
              amount: (bk.qty || 0) * bk.price,
            })
          }
        })
      }
    })

    // Convert map to array
    const items = Array.from(itemMap.values())
    
    // Calculate extra deliveries total
    let totalExtraAmount = 0
    const extraDeliveries: any[] = []
    
    deliveries.forEach(delivery => {
      if (delivery.extra && delivery.extra.qty) {
        const extraAmount = (delivery.extra.qty || 0) * (delivery.extra.price || 0)
        totalExtraAmount += extraAmount
        
        extraDeliveries.push({
          date: delivery.date,
          reason: delivery.extra.reason || "Extra delivery",
          qty: delivery.extra.qty,
          price: delivery.extra.price,
          amount: extraAmount,
        })
      }
    })

    // Add extra item to the list if exists
    if (totalExtraAmount > 0) {
      items.push({
        type: "extra",
        name: "Extra Deliveries",
        price: 0,
        qty: 1,
        amount: totalExtraAmount,
        description: "Additional deliveries for the month",
        details: extraDeliveries,
      })
    }

    const totalAmount = items.reduce((s, i) => s + i.amount, 0)

    return NextResponse.json({
      success: true,
      isGenerated: !!existingBill,
      status: existingBill?.status || "pending",
      paidAmount: existingBill?.paidAmount || 0,

      customer: {
        name: `${customer.name || ''} ${customer.surname || ''}`.trim(),
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