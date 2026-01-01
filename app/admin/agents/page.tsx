import Link from "next/link"
import { MongoClient } from "mongodb"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

/* ================= TYPES ================= */

interface Agent {
  _id: string
  full_name: string
  email: string
  mobile: string
  agency_name: string
  photo?: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

interface AdminJwtPayload {
  adminId: string
  role: "admin"
}

/* ================= MONGO ================= */

const client = new MongoClient(process.env.MONGODB_URI!)

/* ================= PAGE ================= */

export default async function AdminAgentsPage() {
  /* 🔐 AUTH */
  const token = (await cookies()).get("token")?.value
  if (!token) {
    return <div className="p-6 text-red-500">Unauthorized</div>
  }

  let decoded: AdminJwtPayload
  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AdminJwtPayload
  } catch {
    return <div className="p-6 text-red-500">Invalid Token</div>
  }

  if (decoded.role !== "admin") {
    return <div className="p-6 text-red-500">Forbidden</div>
  }

  /* 🗄️ DB */
  await client.connect()
  const db = client.db("maindatabase")
  const agentsCol = db.collection("agents")

  const agents = (await agentsCol
    .find({}, { projection: { password_hash: 0 } })
    .sort({ created_at: -1 })
    .toArray()) as unknown as Agent[]

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Agents</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agent</TableHead>
            <TableHead>Agency</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {agents.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No agents found
              </TableCell>
            </TableRow>
          )}

          {agents.map((agent) => (
            <TableRow key={agent._id}>
              {/* Agent */}
              <TableCell className="flex items-center gap-3">
                 <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          <Avatar className="h-10 w-10">
            {agent.photo && (
              <AvatarImage src={agent.photo} />
            )}
            <AvatarFallback>
              {(agent.full_name[0]).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-md p-0 overflow-hidden">
        {agent.photo ? (
          <img
            src={agent.photo}
            alt="Customer Photo"
            className="w-full h-auto object-contain"
          />
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            No image available
          </div>
        )}
      </DialogContent>
    </Dialog>

                <div>
                  <p className="font-medium">{agent.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {agent.email}
                  </p>
                </div>
              </TableCell>

              {/* Agency */}
              <TableCell>{agent.agency_name}</TableCell>

              {/* Mobile */}
              <TableCell>{agent.mobile}</TableCell>

              {/* Status */}
              <TableCell>
                <Badge
                  variant={
                    agent.status === "approved"
                      ? "default"
                      : agent.status === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {agent.status.toUpperCase()}
                </Badge>
              </TableCell>

              {/* Joined */}
              <TableCell>
                {new Date(agent.created_at).toLocaleDateString()}
              </TableCell>

              {/* Action */}
              <TableCell className="text-right">
                <Link href={`/admin/agents/${agent._id}`}>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
