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
import { CustomerGuid } from "./guid"

/* ================= TYPES ================= */

interface Customer {
  _id: string
  name: string
  surname: string
  email: string
  mobile: string
  gender: "male" | "female" | "other"
  created_at: string
  photo?: string
}

interface AdminJwtPayload {
  adminId: string
  role: "admin"
}

/* ================= MONGO ================= */

const client = new MongoClient(process.env.MONGODB_URI!)

/* ================= PAGE ================= */

export default async function AdminCustomersPage({
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
          { name: { $regex: search, $options: "i" } },
          { surname: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { mobile: { $regex: search, $options: "i" } },
        ],
      }
    : {}

  /* 🗄️ DB */
  await client.connect()
  const db = client.db("maindatabase")
  const customersCol = db.collection("customers")

  const customers = (await customersCol
    .find(query, { projection: { password: 0 } })
    .sort({ created_at: -1 })
    .toArray()) as unknown as Customer[]

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Customers</h1>

      {/* ✅ GUIDE */}
      <CustomerGuid />

      {/* 🔍 SEARCH */}
      <form className="flex gap-2 max-w-sm">
        <input
          name="q"
          defaultValue={search}
          placeholder="Search by name, email or mobile..."
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        <Button size="sm">Search</Button>
      </form>

      {/* 📋 TABLE */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {customers.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
              >
                No customers found
                {search && <> for "<b>{search}</b>"</>}
              </TableCell>
            </TableRow>
          )}

          {customers.map((customer) => (
            <TableRow key={customer._id}>
              {/* Customer */}
              <TableCell className="flex items-center gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="cursor-pointer">
                      <Avatar className="h-10 w-10">
                        {customer.photo && (
                          <AvatarImage src={customer.photo} />
                        )}
                        <AvatarFallback>
                          {(customer.name[0] + customer.surname[0]).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </DialogTrigger>

                  <DialogContent className="max-w-md p-0 overflow-hidden">
                    {customer.photo ? (
                      <img
                        src={customer.photo}
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
                  <p className="font-medium">
                    {customer.name} {customer.surname}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {customer.email}
                  </p>
                </div>
              </TableCell>

              <TableCell>{customer.mobile}</TableCell>

              <TableCell className="capitalize">
                {customer.gender}
              </TableCell>

              <TableCell>
                {new Date(customer.created_at).toLocaleDateString()}
              </TableCell>

              <TableCell className="text-right">
                <Link href={`/admin/customers/${customer._id}`}>
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
