import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { v2 as cloudinary } from "cloudinary"

/* =====================
   Types
===================== */
interface CustomerJwtPayload {
  customerId: string
  role: "customer"
}

/* =====================
   MongoDB
===================== */
const client = new MongoClient(process.env.MONGODB_URI!)

/* =====================
   Cloudinary (Photo)
===================== */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

/* ======================================================
   GET → Fetch customer profile
====================================================== */
export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as CustomerJwtPayload

    if (decoded.role !== "customer")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    await client.connect()
    const db = client.db("maindatabase")
    const customers = db.collection("customers")

    const customer = await customers.findOne(
      { _id: new ObjectId(decoded.customerId) },
      { projection: { password: 0 } } // 🔐 hide password
    )

    return NextResponse.json({ success: true, customer })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

/* ======================================================
   PUT → Update customer profile (+ photo optional)
====================================================== */
export async function PUT(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as CustomerJwtPayload

    if (decoded.role !== "customer")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const formData = await req.formData()

    /* 📷 Photo upload (optional) */
    let photoUrl: string | undefined

    const photoFile = formData.get("photo") as File | null
    if (photoFile) {
      const buffer = Buffer.from(await photoFile.arrayBuffer())

      const upload: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "customers" }, (err, result) => {
            if (err) reject(err)
            else resolve(result)
          })
          .end(buffer)
      })

      photoUrl = upload.secure_url
    }

    /* 📝 Update object */
    const updateData: any = {
      name: formData.get("name"),
      surname: formData.get("surname"),
      mobile: formData.get("mobile"),
      email: formData.get("email"),
      address: formData.get("address"),
      state: formData.get("state"),
      district: formData.get("district"),
      tehsil: formData.get("tehsil"),
      village: formData.get("village"),
      pincode: formData.get("pincode"),
      age: Number(formData.get("age")),
      gender: formData.get("gender"),
    }

    if (photoUrl) {
      updateData.photo = photoUrl
    }

    await client.connect()
    const db = client.db("maindatabase")
    const customers = db.collection("customers")

    await customers.updateOne(
      { _id: new ObjectId(decoded.customerId) },
      { $set: updateData }
    )

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
