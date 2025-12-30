import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcrypt";

/* ================== CONFIG ================== */

// MongoDB
const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = "maindatabase";

// Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/* ================== ROUTE ================== */

export async function POST(req: Request) {
  let client: MongoClient | null = null;

  try {
    const formData = await req.formData();

    /* ---- Password Handling ---- */
    const password = formData.get("password") as string;

    if (!password) {
      return NextResponse.json(
        { success: false, message: "Password is required" },
        { status: 400 }
      );
    }

    const password_hash = await bcrypt.hash(password, 10);

    /* ---- Photo Upload ---- */
    const photo = formData.get("photo") as File | null;
    let photoUrl = "";

    if (photo) {
      const buffer = Buffer.from(await photo.arrayBuffer());

      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "agents" }, (error, result) => {
            if (error) reject(error);
            resolve(result);
          })
          .end(buffer);
      });

      photoUrl = uploadResult.secure_url;
    }

    /* ---- MongoDB ---- */
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    const agents = db.collection("agents");

    /* ---- Duplicate Email ---- */
    const email = formData.get("email");

    const existingAgent = await agents.findOne({ email });
    if (existingAgent) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 409 }
      );
    }

    /* ---- Agent Object ---- */
    const agent = {
      full_name: formData.get("full_name"),
      mobile: formData.get("mobile"),
      email,

      password_hash, // ✅ stored securely

      address: formData.get("address"),
      state: formData.get("state"),
      district: formData.get("district"),
      tehsil: formData.get("tehsil"),
      village: formData.get("village"),
      pincode: formData.get("pincode"),

      agency_name: formData.get("agency_name"),
      agency_phone: formData.get("agency_phone"),

      age: Number(formData.get("age")),
      gender: formData.get("gender"),

      photo: photoUrl,
      status: "pending", // 🔥 admin approval system
      created_at: new Date(),
    };

    const result = await agents.insertOne(agent);

    return NextResponse.json(
      {
        success: true,
        agent_id: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}
