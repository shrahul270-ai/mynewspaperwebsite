import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { MongoClient, ObjectId } from "mongodb"
import { AgentJwtPayload } from "@/lib/models"

export async function GET(request: NextRequest) {
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

    /* 🗄 DB */
    client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
    const db = client.db("maindatabase")

    const deliveriesCol = db.collection("hokerDeliveries")

    /* 📦 AGGREGATION (MODEL AWARE) */
    const deliveries = await deliveriesCol.aggregate([
      {
        $match: {
          agentId: new ObjectId(agentId),
        },
      },

      /* 👤 CUSTOMER */
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true,
        },
      },

      /* 👷 HOKER */
      {
        $lookup: {
          from: "hokers",
          localField: "hokerId",
          foreignField: "_id",
          as: "hoker",
        },
      },
      {
        $unwind: {
          path: "$hoker",
          preserveNullAndEmptyArrays: true,
        },
      },

      /* 🔢 TOTAL CALCULATION (FIXED - CORRECT FIELD ACCESS) */
      {
        $addFields: {
          totalNewspaperQty: {
            $sum: {
              $map: {
                input: { $ifNull: ["$newspapers", []] },
                as: "n",
                in: "$$n.qty",
              },
            },
          },

          totalBookletQty: {
            $sum: {
              $map: {
                input: { $ifNull: ["$booklets", []] },
                as: "b",
                in: "$$b.qty",
              },
            },
          },

          totalExtraQty: {
            $ifNull: ["$extra.qty", 0],
          },
        },
      },

      { $sort: { date: -1 } },

      /* 📤 RESPONSE SHAPE */
      {
        $project: {
          _id: 1,
          date: 1,

          customerName: {
            $ifNull: ["$customer.full_name", "$customer.email"],
          },

          hokerName: {
            $ifNull: ["$hoker.full_name", "Unknown"],
          },

          totalNewspaperQty: 1,
          totalBookletQty: 1,
          totalExtraQty: 1,

          // Include detailed arrays for debugging/verification
          newspapers: { $ifNull: ["$newspapers", []] },
          booklets: { $ifNull: ["$booklets", []] },
          extra: { $ifNull: ["$extra", null] },

          remarks: { $ifNull: ["$remarks", ""] },
        },
      },
    ]).toArray()

    return NextResponse.json({
      success: true,
      deliveries,
    })
  } catch (error) {
    console.error("GET DELIVERIES ERROR:", error)
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    )
  } finally {
    if (client) await client.close()
  }
}