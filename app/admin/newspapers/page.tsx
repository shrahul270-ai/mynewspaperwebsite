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
import { Badge } from "@/components/ui/badge"

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
//   console.log("Agent : "+agentId)

  await client.connect()
  const db = client.db("maindatabase")
  const newspapers = await db
    .collection<Newspaper>("newspapers")
    .find({})
    .toArray()

    const paperid = new ObjectId(newspapers[0].agentId )
    console.log(paperid)    

  return (
    <div className="p-6">
        <div className="flex justify-between">

      <h1 className="text-xl font-semibold mb-4">Newspapers List</h1>
            {/* <Link href="/agent/add-newspaper"><Button variant={"outline"}>Add Your</Button></Link> */}
        </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="text-right">Edit</TableHead>

          </TableRow>
        </TableHeader>

        <TableBody>
          {newspapers.map((paper) => (
            <TableRow key={paper._id}>
              <TableCell>{paper.name}</TableCell>
              <TableCell>{paper.language}</TableCell>
              <TableCell>₹{paper.price}</TableCell>

              <TableCell className="text-right">
                <Badge variant={"default"}>Active</Badge>
              </TableCell>
              <TableCell className="text-right">
                <a href={`/admin/newspapers/${paper._id}/edit`}>
                  <Button>Edit</Button>
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
