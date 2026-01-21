import { headers } from "next/headers"
import { MongoClient } from "mongodb"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/* =====================
   Interface
===================== */
export interface Newspaper {
  _id: string
  name: string
  language: string
  price: {
    monday: number
    tuesday: number
    wednesday: number
    thursday: number
    friday: number
    saturday: number
    sunday: number
  }
}

/* =====================
   Mongo
===================== */
const client = new MongoClient(process.env.MONGODB_URI!)

function getTodayPrice(price: Newspaper["price"]) {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ] as const

  return price[days[new Date().getDay()]]
}

export default async function AgentNewspapers() {
  await headers() // auth already handled in middleware

  await client.connect()
  const db = client.db("maindatabase")

  const newspapers = await db
    .collection<Newspaper>("newspapers")
    .find({})
    .toArray()

  return (
    <div className="p-6 space-y-6">

      {/* ================= GUIDE ================= */}
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>📢 महत्वपूर्ण जानकारी</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>👉 ये सभी अख़बार <b>एडमिन द्वारा बनाए गए</b> हैं।</p>
          <p>👉 कीमत <b>दिन के अनुसार</b> बदल सकती है।</p>
          <p>👉 नीचे <b>आज की कीमत</b> दिखाई गई है।</p>
          <p>👉 एजेंट केवल ग्राहकों को अलॉट कर सकता है।</p>
        </CardContent>
      </Card>

      {/* ================= TABLE ================= */}
      <h1 className="text-xl font-semibold">Newspapers List</h1>

      <div className="w-full overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Today Price</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {newspapers.map((paper) => (
              <TableRow key={paper._id}>
                <TableCell>{paper.name}</TableCell>
                <TableCell>{paper.language}</TableCell>

                {/* ✅ Correct price */}
                <TableCell>
                  ₹{getTodayPrice(paper.price)}
                </TableCell>

                <TableCell className="text-right">
                  <Badge>Active</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
