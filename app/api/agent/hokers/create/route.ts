import { NextResponse, NextRequest } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

/* ================= CONFIG ================= */

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = "maindatabase";
const JWT_SECRET = process.env.JWT_SECRET!;

/* ================= POST API ================= */

export async function POST(req: NextRequest) {
  let client: MongoClient | null = null;

  try {
    /* ---------- JWT FROM COOKIES (LATEST WAY) ---------- */
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token missing" },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const agentId = decoded.agentId;

    if (!agentId) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    /* ---------- BODY ---------- */
    const {
      full_name,
      mobile,
      email,
      age,
      gender,
      address,
      state,
      district,
      tehsil,
      village,
      pincode,
      photo,
    } = await req.json();

    if (!full_name || !mobile || !age || !gender) {
      return NextResponse.json(
        { success: false, message: "Required fields missing" },
        { status: 400 }
      );
    }

    /* ---------- DB CONNECT ---------- */
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);

    /* ---------- INSERT HOKER ---------- */
    const result = await db.collection("hokers").insertOne({
      full_name,
      mobile,
      email: email || "",
      agent: new ObjectId(agentId),

      address: address || "",
      state: state || "",
      district: district || "",
      tehsil: tehsil || "",
      village: village || "",
      pincode: pincode || "",

      age: Number(age),
      gender,

      photo: photo || null,
      created_at: new Date(),
    });

    return NextResponse.json({
      success: true,
      hokerId: result.insertedId,
    });
  } catch (error) {
    console.error("CREATE HOKER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}
