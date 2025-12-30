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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "../ui/button"

export interface HokerProfile {
  id: number
  full_name: string
  mobile: string
  email: string
  agent: ObjectId

  address: string
  state: string
  district: string
  tehsil: string
  village: string
  pincode: string

  age: number
  gender: "Male" | "Female" | "Other"

  photo?: string | null
  created_at: string
}

export default async function AgentHokers() {
  // ✅ Agent ID from headers
  const agentId = (await headers()).get("ID")
  

  if (!agentId) {
    return <div className="text-red-500">Agent ID missing</div>
  }

  // ✅ MongoDB Native (NO mongoose)
  const client = new MongoClient(process.env.MONGODB_URI!)
  await client.connect()

  const db = client.db("maindatabase")
  const hokers = await db
    .collection<HokerProfile>("hokers")
    .find({ agent : new ObjectId(agentId) })
    .sort({ created_at: -1 })
    .toArray()

    // console.log(agentId + ":" + hokers[0])

  await client.close()

  return (
    <div className="space-y-4">
        <div className="flex justify-between">

      <h3 className="text-lg font-semibold">
        Agent #{agentId} Hokers
      </h3>
      <a href="/agent/add-hocker">
      <Button >Add Hocker</Button>
      </a>
        </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Hoker</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Edit</TableHead>

            </TableRow>
          </TableHeader>

          <TableBody>
            {hokers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No hokers found
                </TableCell>
              </TableRow>
            )}

            {hokers.map((hoker, index) => (
              <TableRow key={hoker._id?.toString() ?? index}>
                <TableCell>{index + 1}</TableCell>

                <TableCell className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={hoker.photo || ""} />
                    <AvatarFallback>
                      {hoker.full_name[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="font-medium">{hoker.full_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {hoker.email}
                    </div>
                  </div>
                </TableCell>

                <TableCell>{hoker.mobile}</TableCell>

                <TableCell>
                  {hoker.village}, {hoker.tehsil}
                  <br />
                  <span className="text-sm text-muted-foreground">
                    {hoker.district}, {hoker.state}
                  </span>
                </TableCell>

                <TableCell>
                  <Badge variant="outline">{hoker.gender}</Badge>
                </TableCell>

                <TableCell>{hoker.age}</TableCell>
                <TableCell><a href={`/agent/edit/hocker/${hoker._id}`}> <Button value="secondary" >Edit</Button></a></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
