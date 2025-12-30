import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import { v2 as cloudinary } from "cloudinary"

/* =======================
   MongoDB
======================= */
const client = new MongoClient(process.env.MONGODB_URI!)

/* =======================
   Cloudinary
======================= */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const id = formData.get("id") as string

    if (!id) {
      return NextResponse.json({ error: "Hoker ID missing" }, { status: 400 })
    }

    /* =======================
       Build Update Object
    ======================= */
    const updateData: any = {}

    formData.forEach((value, key) => {
      if (["id", "agent", "photo"].includes(key)) return
      updateData[key] = value.toString()
    })

    /* =======================
       Photo Upload
    ======================= */
    const photo = formData.get("photo")

    if (photo && photo instanceof File && photo.size > 0) {
      const buffer = Buffer.from(await photo.arrayBuffer())

      const upload: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "hokers" },
            (err, result) => {
              if (err) reject(err)
              else resolve(result)
            }
          )
          .end(buffer)
      })

      updateData.photo = upload.secure_url
    }

    updateData.updated_at = new Date()

    /* =======================
       MongoDB Update
    ======================= */
    await client.connect()
    const db = client.db("maindatabase")
    const hokers = db.collection("hokers")

    await hokers.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}
