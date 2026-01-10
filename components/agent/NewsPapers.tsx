import { headers } from "next/headers"
import { MongoClient, ObjectId } from "mongodb"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/* =====================
   Interface
===================== */
export interface Newspaper {
  _id: string
  name: string
  price: number
  language: string
  agentId: string
}

/* =====================
   Mongo
===================== */
const client = new MongoClient(process.env.MONGODB_URI!)

export default async function AgentNewspapers() {
  // 🔐 Agent ID from headers
  const agentId = (await headers()).get("ID")

  await client.connect()
  const db = client.db("maindatabase")

  // ⚠️ Admin-created newspapers (same for all agents)
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
          <p>
            👉 इस सूची में <b>सभी अख़बार</b> दिखाए गए हैं जो
            <b> एडमिन द्वारा बनाए गए हैं।</b>
          </p>
          <p>
            👉 यहाँ दिख रहे अख़बार <b>सभी एजेंट के लिए समान</b> होते हैं।
          </p>
          <p>
            👉 <b>नया अख़बार जोड़ने</b> या <b>अख़बार की कीमत बदलने</b> का अधिकार
            <b> केवल एडमिन के पास होता है।</b>
          </p>
          <p>
            👉 एजेंट केवल इन अख़बारों को ग्राहकों को अलॉट कर सकता है।
          </p>
        </CardContent>
      </Card>

      {/* ================= TABLE ================= */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Newspapers List</h1>
        {/* Admin-only action */}
        {/* <Link href="/agent/add-newspaper">
          <Button variant="outline">Add Your</Button>
        </Link> */}
      </div>

      <div className="w-full overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {newspapers.map((paper) => (
              <TableRow key={paper._id}>
                <TableCell>{paper.name}</TableCell>
                <TableCell>{paper.language}</TableCell>
                <TableCell>₹{paper.price}</TableCell>

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
