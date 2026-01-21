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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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

  const today = days[new Date().getDay()]
  return price[today]
}

export default async function AgentNewspapers() {
  await client.connect()
  const db = client.db("maindatabase")

  const newspapers = await db
    .collection<Newspaper>("newspapers")
    .find({})
    .toArray()

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">
        Newspapers List
      </h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Today Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Edit</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {newspapers.map((paper) => (
            <TableRow key={paper._id}>
              <TableCell>{paper.name}</TableCell>
              <TableCell>{paper.language}</TableCell>

              {/* ✅ Today price */}
              <TableCell>
                ₹{getTodayPrice(paper.price)}
              </TableCell>

              <TableCell>
                <Badge>Active</Badge>
              </TableCell>

              <TableCell className="text-right">
                <a href={`/admin/newspapers/${paper._id}/edit`}>
                  <Button size="sm">Edit</Button>
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
