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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { HokerAdminGuide } from "./Guid"

/* ================= TYPES ================= */

interface Hoker {
  _id: string
  full_name: string
  mobile: string
  email: string
  address: string
  state: string
  district: string
  tehsil: string
  village: string
  pincode: string
  age: string
  gender: "male" | "female" | "other"
  photo?: string
  created_at: string
}

interface AdminJwtPayload {
  adminId: string
  role: "admin"
}

/* ================= MONGO ================= */

const client = new MongoClient(process.env.MONGODB_URI!)

/* ================= PAGE ================= */

export default async function AdminHokersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>
}) {
  /* 🔐 AUTH */
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) return <div className="p-6 text-red-500">Unauthorized</div>

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

  /* 🔍 SEARCH */
  const resolvedSearchParams = await searchParams
  const search = resolvedSearchParams?.q?.trim() || ""

  const query = search
    ? {
        $or: [
          { full_name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { mobile: { $regex: search, $options: "i" } },
          { village: { $regex: search, $options: "i" } },
        ],
      }
    : {}

  /* 🗄️ DB */
  await client.connect()
  const db = client.db("maindatabase")
  const hokersCol = db.collection("hokers")

  const hokers = (await hokersCol
    .find(query)
    .sort({ created_at: -1 })
    .toArray()) as unknown as Hoker[]

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Hokers</h1>

      {/* ✅ GUIDE */}
     <HokerAdminGuide />

      {/* 🔍 SEARCH */}
      <form className="flex gap-2 max-w-sm">
        <input
          name="q"
          defaultValue={search}
          placeholder="Search by name, mobile, email..."
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        <Button size="sm">Search</Button>
      </form>

      {/* 📋 TABLE */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hoker</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {hokers.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
              >
                No hokers found
                {search && <> for "<b>{search}</b>"</>}
              </TableCell>
            </TableRow>
          )}

          {hokers.map((hoker) => (
            <TableRow key={hoker._id}>
              {/* HOKER */}
              <TableCell className="flex items-center gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="cursor-pointer">
                      <Avatar className="h-10 w-10">
                        {hoker.photo && (
                          <AvatarImage src={hoker.photo} />
                        )}
                        <AvatarFallback>
                          {hoker.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </DialogTrigger>

                  <DialogContent className="max-w-md p-0 overflow-hidden">
                    {hoker.photo ? (
                      <img
                        src={hoker.photo}
                        alt={hoker.full_name}
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
                  <p className="font-medium">{hoker.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {hoker.email}
                  </p>
                </div>
              </TableCell>

              <TableCell>{hoker.mobile}</TableCell>

              <TableCell className="capitalize">
                {hoker.gender}
              </TableCell>

              <TableCell>
                {hoker.village}, {hoker.district}
              </TableCell>

              <TableCell>
                {new Date(hoker.created_at).toLocaleDateString()}
              </TableCell>

              <TableCell className="text-right">
                <Link href={`/admin/hokers/${hoker._id}`}>
                  <Button size="sm" variant="outline">
                    Edit/View
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
