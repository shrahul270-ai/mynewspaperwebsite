// /api/admin/export-excel/route.ts
import * as XLSX from "xlsx"
import { MongoClient } from "mongodb"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const col = new URL(req.url).searchParams.get("col")!

  const client = new MongoClient(process.env.MONGODB_URI!)
  await client.connect()

  const data = await client
    .db("maindatabase")
    .collection(col)
    .find({})
    .limit(1000)
    .toArray()

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Data")

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

  await client.close()

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=${col}.xlsx`,
    },
  })
}
