"use server";

import { MongoClient, ObjectId } from "mongodb";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import CustomerDetailsDialog from "@/components/CustomerDetailsDialog"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

/* ================== CONFIG ================== */

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = "maindatabase";

/* ================== PAGE ================== */

export default async function AgentCustomers() {
  const headersList = await headers();
  const agentId = headersList.get("ID");

  // ✅ FIX: सही तरीके से search parameter निकालें
  const urlHeader = headersList.get("url") || "";
  let search = "";

  // URL को parse करें और search parameter निकालें
  if (urlHeader) {
    try {
      // Next.js headers में URL protocol नहीं होता, इसलिए add करना पड़ता है
      const fullUrl = urlHeader.startsWith('http') ? urlHeader : `https://${urlHeader}`;
      const url = new URL(fullUrl);
      search = url.searchParams.get("q")?.trim() || "";
    } catch (error) {
      console.error("Error parsing URL:", error);
    }
  }

  if (!agentId) {
    return (
      <div className="p-6 text-sm opacity-70">
        Agent ID not found in headers
      </div>
    );
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  /* 🔥 JOIN + SEARCH */
  const customers = await db
    .collection("allotedcustomers")
    .aggregate([
      {
        $match: {
          agent: new ObjectId(agentId),
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customerInfo",
        },
      },
      { $unwind: "$customerInfo" },

      // 🔍 SEARCH FILTER (NAME / MOBILE)
      ...(search
        ? [
          {
            $match: {
              $or: [
                {
                  "customerInfo.name": {
                    $regex: search,
                    $options: "i",
                  },
                },
                {
                  "customerInfo.mobile": {
                    $regex: search,
                    $options: "i",
                  },
                },
              ],
            },
          },
        ]
        : []),
    ])
    .toArray();

  await client.close();

  return (
    <div className="p-6 w-full h-full space-y-6">

      {/* ================= GUIDE ================= */}
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>📢 महत्वपूर्ण जानकारी</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            👉 यहाँ केवल <b>इस एजेंट को अलॉट किए गए ग्राहक</b> दिखते हैं।
          </p>
          <p>
            👉 ऊपर दिए गए सर्च बॉक्स से आप
            <b> नाम या मोबाइल नंबर</b> से ग्राहक खोज सकते हैं।
          </p>
          <p>
            👉 <b>Deliver</b> से डिलीवरी दर्ज करें।
          </p>
          <p>
            👉 <b>Edit</b> से अख़बार / अलॉटमेंट बदलें।
          </p>
        </CardContent>
      </Card>

      {/* ================= SEARCH ================= */}
      <Card>
        <CardContent className="p-4">
          <form className="flex gap-3">
            <Input
              name="q"
              defaultValue={search}
              placeholder="नाम या मोबाइल नंबर से खोजें"
            />
            <Button type="submit">Search</Button>

            {search && (
              <Link href="/agent/customers">
                <Button variant="outline">Clear</Button>
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      {/* ================= TABLE ================= */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>एजेंट को अलॉट किए गए ग्राहक</CardTitle>
        </CardHeader>

        <CardContent className="w-full overflow-x-auto">
          {customers.length === 0 ? (
            <p className="text-sm opacity-70 text-center">
              {search ? `"${search}" से कोई ग्राहक नहीं मिला।` : "कोई ग्राहक नहीं मिला।"}
            </p>
          ) : (
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  {/* ✅ PHOTO COLUMN ADDED */}
                  <TableHead>फोटो</TableHead>
                  <TableHead>नाम</TableHead>
                  <TableHead>मोबाइल</TableHead>
                  <TableHead>PB</TableHead>
                  <TableHead>BH</TableHead>
                  <TableHead>HT</TableHead>
                  <TableHead>TIMES</TableHead>
                  <TableHead>HINDU</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead>Delievery</TableHead>
                  <TableHead>Edit/View</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {customers.map((item: any) => (
                  <TableRow key={item._id.toString()}>
                    {/* ✅ PHOTO DISPLAY */}
                    <TableCell>
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Avatar className="w-10 h-10 cursor-pointer">
                              <AvatarImage src={item.customerInfo.photo || ""} />
                              <AvatarFallback>
                                {item.customerInfo.name?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                          </DialogTrigger>

                          <DialogContent className="max-w-md p-0 overflow-hidden">
                            {item.customerInfo.photo ? (
                              <div className="relative w-full h-[400px]">
                                <Image
                                  src={item.customerInfo.photo}
                                  alt={item.customerInfo.name}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            ) : (
                              <div className="p-6 text-center text-sm text-muted-foreground">
                                No Photo Available
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                      </div>
                    </TableCell>

                    <TableCell>{item.customerInfo.name}</TableCell>
                    <TableCell>{item.customerInfo.mobile}</TableCell>

                    <TableCell>{item.PB}</TableCell>
                    <TableCell>{item.BH}</TableCell>
                    <TableCell>{item.HT}</TableCell>
                    <TableCell>{item.TIMES}</TableCell>
                    <TableCell>{item.HINDU}</TableCell>

                    <TableCell>
                      {item.is_active ? (
                        <Badge>Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-xs">
                      {new Date(item.allotted_on).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <Link href={`/agent/add-delivery?id=${item.customer}`}>
                        <Button>Deliver</Button>
                      </Link>
                    </TableCell>

                    <TableCell>
                      <Link href={`/agent/edit-allotment?id=${item.customer}`}>
                        <Button variant="outline">Edit/View</Button>
                      </Link>


                      
                    </TableCell>

                    <TableCell>
  <CustomerDetailsDialog
    customerId={item.customer.toString()}
  />
</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}