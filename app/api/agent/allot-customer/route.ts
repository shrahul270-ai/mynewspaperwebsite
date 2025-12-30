import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = "maindatabase";
const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  let client: MongoClient | null = null;

  try {
    // 🔹 1️⃣ Read token from cookies (CORRECT WAY)
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "JWT missing" },
        { status: 401 }
      );
    }

    // 🔹 2️⃣ Verify JWT (CORRECT PAYLOAD)
    const decoded = jwt.verify(token, JWT_SECRET) as {
      agentId: string;
      role: string;
    };

    const agentId = decoded.agentId;
    if (!agentId) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // 🔹 3️⃣ Read body
    const { customerId, PB, BH, HT, TIMES, HINDU } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { success: false, message: "customerId required" },
        { status: 400 }
      );
    }

    // 🔹 4️⃣ DB connect
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);

    // 🔹 5️⃣ Insert record
    const result = await db.collection("allotedcustomers").insertOne({
      agent: new ObjectId(agentId),
      customer: new ObjectId(customerId),
      PB: PB ?? 0,
      BH: BH ?? 0,
      HT: HT ?? 0,
      TIMES: TIMES ?? 0,
      HINDU: HINDU ?? 0,
      is_active: true,
      allotted_on: new Date(),
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("ASSIGN ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  } finally {
    await client?.close();
  }
}
