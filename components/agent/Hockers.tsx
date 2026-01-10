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
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
  const agentId = (await headers()).get("ID")

  if (!agentId) {
    return <div className="text-red-500">Agent ID missing</div>
  }

  const client = new MongoClient(process.env.MONGODB_URI!)
  await client.connect()

  const db = client.db("maindatabase")
  const hokers = await db
    .collection<HokerProfile>("hokers")
    .find({ agent: new ObjectId(agentId) })
    .sort({ created_at: -1 })
    .toArray()

  await client.close()

  return (
    <div className="space-y-6">

      {/* ================= GUIDES ================= */}
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>📢 आवश्यक जानकारी</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            👉 इस पृष्ठ पर <b>सभी हॉकर्स नहीं</b>, बल्कि
            <b> केवल वही हॉकर्स दिखाए गए हैं जो इस एजेंट से जुड़े हुए हैं।</b>
          </p>
          <p>
            👉 किसी हॉकर की <b>तस्वीर पर क्लिक</b> करने से उसकी बड़ी फोटो दिखाई देगी।
          </p>
          <p>
            👉 <b>Add Hocker</b> बटन से नए हॉकर को जोड़ा जा सकता है।
          </p>
          <p>
            👉 <b>Edit</b> बटन से हॉकर की जानकारी बदली जा सकती है।
          </p>
        </CardContent>
      </Card>

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          इस एजेंट के हॉकर्स
        </h3>

        <a href="/agent/add-hocker">
          <Button>Add Hocker</Button>
        </a>
      </div>

      {/* ================= TABLE ================= */}
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>हॉकर</TableHead>
              <TableHead>मोबाइल</TableHead>
              <TableHead>स्थान</TableHead>
              <TableHead>लिंग</TableHead>
              <TableHead>आयु</TableHead>
              <TableHead>संपादन</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {hokers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  अभी इस एजेंट के लिए कोई हॉकर मौजूद नहीं है।
                </TableCell>
              </TableRow>
            )}

            {hokers.map((hoker, index) => (
              <TableRow key={hoker._id?.toString() ?? index}>
                <TableCell>{index + 1}</TableCell>

                <TableCell className="flex items-center gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Avatar className="cursor-pointer">
                        <AvatarImage src={hoker.photo || ""} />
                        <AvatarFallback>
                          {hoker.full_name[0]}
                        </AvatarFallback>
                      </Avatar>
                    </DialogTrigger>

                    <DialogContent className="max-w-md p-0 overflow-hidden">
                      <img
                        src={hoker.photo || ""}
                        alt={hoker.full_name}
                        className="w-full h-auto object-contain"
                      />
                    </DialogContent>
                  </Dialog>

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

                <TableCell>
                  <a href={`/agent/edit/hocker/${hoker._id}`}>
                    <Button variant="secondary">Edit</Button>
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
