import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

// MongoDB connection string check
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in environment variables");
}

const client = new MongoClient(MONGODB_URI!);

interface AgentJwtPayload {
  agentId: string;
  role: "agent";
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Authentication
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AgentJwtPayload;

    if (!decoded.agentId) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const agentId = new ObjectId(decoded.agentId);

    // Connect to database
    try {
      await client.connect();
    } catch (connectError) {
      console.error("MongoDB connection error:", connectError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const db = client.db("maindatabase");

    // Collections
    const allotCol = db.collection("allotedcustomers");
    const hokerCol = db.collection("hokers");
    const billCol = db.collection("generated_bills");
    const deliveryCol = db.collection("hokerDeliveries");

    // Get active customers count
    const activeCustomers = await allotCol.aggregate([
      {
        $match: { 
          agent: agentId,
          is_active: true 
        }
      },
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customerData"
        }
      },
      {
        $match: {
          "customerData.0": { $exists: true }
        }
      },
      {
        $count: "total"
      }
    ]).toArray();

    const totalCustomers = activeCustomers[0]?.total || 0;

    // Get total hokers
    const totalHokers = await hokerCol.countDocuments({
      agent: agentId
    });

    // Current month calculations
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    console.log(`Looking for bills for month: ${currentMonth}, year: ${currentYear}, agent: ${agentId}`);

    // Get bills for current month
    const billsThisMonth = await billCol.find({
      agentId,
      month: currentMonth,
      year: currentYear
    }).toArray();

    console.log(`Found ${billsThisMonth.length} bills for current month`);

    const thisMonthBills = billsThisMonth.length;

    // Calculate bill statistics
    let paidAmount = 0;
    let pendingAmount = 0;
    let paidBills = 0;
    let pendingBills = 0;
    let lastGeneratedAt: string | null = null;

    for (const bill of billsThisMonth) {
      console.log(`Processing bill:`, {
        id: bill._id,
        status: bill.status,
        totalAmount: bill.totalAmount,
        paidAmount: bill.paidAmount
      });

      if (bill.generated_at) {
        const generatedAt = new Date(bill.generated_at).toISOString();
        if (!lastGeneratedAt || generatedAt > lastGeneratedAt) {
          lastGeneratedAt = generatedAt;
        }
      }

      if (bill.status === "paid") {
        paidBills++;
        const paid = Number(bill.paidAmount) || 0;
        paidAmount += paid;
        console.log(`Added paid bill: ${paid}`);
      } else {
        pendingBills++;
        const total = Number(bill.totalAmount) || 0;
        const paid = Number(bill.paidAmount) || 0;
        const pending = Math.max(0, total - paid);
        pendingAmount += pending;
        console.log(`Added pending bill: total=${total}, paid=${paid}, pending=${pending}`);
      }
    }

    console.log(`Final stats - Paid: ₹${paidAmount}, Pending: ₹${pendingAmount}`);
    console.log(`Paid bills: ${paidBills}, Pending bills: ${pendingBills}`);

    // Today's statistics
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const todayDeliveries = await deliveryCol.find({
      agentId,
      date: { $gte: todayStart, $lt: todayEnd }
    }).toArray();

    const deliveriesToday = todayDeliveries.length;

    // Get unique hokers who worked today
    const hokerIds = todayDeliveries
      .filter(d => d.hokerId)
      .map(d => d.hokerId?.toString());
    const hokersWorkedToday = new Set(hokerIds).size;

    // Get recent deliveries (last 5)
    let recentDeliveries: any[] = [];
    try {
      recentDeliveries = await deliveryCol
        .aggregate([
          { $match: { agentId } },
          { $sort: { date: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "customers",
              localField: "customerId",
              foreignField: "_id",
              as: "customer"
            }
          },
          {
            $lookup: {
              from: "hokers",
              localField: "hokerId",
              foreignField: "_id",
              as: "hoker"
            }
          },
          {
            $project: {
              _id: 1,
              date: 1,
              items: {
                $add: [
                  { $size: { $ifNull: ["$newspapers", []] } },
                  { $size: { $ifNull: ["$booklets", []] } }
                ]
              },
              customerName: {
                $cond: {
                  if: { $gt: [{ $size: "$customer" }, 0] },
                  then: {
                    $concat: [
                      { $ifNull: [{ $arrayElemAt: ["$customer.name", 0] }, ""] },
                      " ",
                      { $ifNull: [{ $arrayElemAt: ["$customer.surname", 0] }, ""] }
                    ]
                  },
                  else: "Deleted Customer"
                }
              },
              hokerName: {
                $cond: {
                  if: { $gt: [{ $size: "$hoker" }, 0] },
                  then: { $ifNull: [{ $arrayElemAt: ["$hoker.full_name", 0] }, "Unknown"] },
                  else: "Unknown Hoker"
                }
              }
            }
          }
        ])
        .toArray();
    } catch (aggError) {
      console.error("Recent deliveries aggregation error:", aggError);
    }

    // Get recent payments (last 5)
    let recentPayments: any[] = [];
    try {
      recentPayments = await billCol
        .aggregate([
          {
            $match: {
              agentId,
              status: "paid"
            }
          },
          { $sort: { paidAt: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "customers",
              localField: "customerId",
              foreignField: "_id",
              as: "customer"
            }
          },
          {
            $project: {
              _id: 1,
              paidAmount: 1,
              paidAt: 1,
              customerName: {
                $cond: {
                  if: { $gt: [{ $size: "$customer" }, 0] },
                  then: {
                    $concat: [
                      { $ifNull: [{ $arrayElemAt: ["$customer.name", 0] }, ""] },
                      " ",
                      { $ifNull: [{ $arrayElemAt: ["$customer.surname", 0] }, ""] }
                    ]
                  },
                  else: "Deleted Customer"
                }
              }
            }
          }
        ])
        .toArray();
    } catch (paymentsError) {
      console.error("Recent payments aggregation error:", paymentsError);
    }

    // Format dates for response
    const formattedRecentDeliveries = recentDeliveries.map(delivery => ({
      ...delivery,
      date: delivery.date?.toISOString?.() || new Date().toISOString()
    }));

    const formattedRecentPayments = recentPayments.map(payment => ({
      ...payment,
      paidAt: payment.paidAt?.toISOString?.() || new Date().toISOString()
    }));

    // Prepare response
    const response = {
      summary: {
        totalCustomers,
        totalHokers,
        thisMonthBills,
        paidAmount,
        pendingAmount
      },
      bills: {
        paid: paidBills,
        pending: pendingBills,
        lastGeneratedAt
      },
      today: {
        deliveries: deliveriesToday,
        hokersWorked: hokersWorkedToday
      },
      recentDeliveries: formattedRecentDeliveries,
      recentPayments: formattedRecentPayments
    };

    console.log("Response being sent:", JSON.stringify(response, null, 2));

    return NextResponse.json(response);

  } catch (error) {
    console.error("Agent dashboard view error:", error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? "Error " : undefined
      },
      { status: 500 }
    );
  }
}