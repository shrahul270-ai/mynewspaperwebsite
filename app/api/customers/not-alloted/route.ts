import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = "maindatabase";



export async function GET() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect()
    const db = client.db(DB_NAME);

    // 1️⃣ Alloted customer IDs
    const alloted = await db
      .collection("allotedcustomers")
      .find({}, { projection: { customer: 1 } })
      .toArray();

    const allotedCustomerIds = alloted.map((item) => new ObjectId(item.customer));

    // 2️⃣ Customers NOT in allotted list
    const customers = await db
      .collection("customers")
      .find({ _id: { $nin: allotedCustomerIds } })
      .toArray();

    return NextResponse.json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
