"use server";

import { MongoClient, ObjectId } from "mongodb";
import { headers } from "next/headers";
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
import Link from "next/link";
import { Button } from "../ui/button";

/* ================== CONFIG ================== */

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = "maindatabase";

/* ================== PAGE ================== */

export default async function AgentCustomers() {
  const headersList = await headers();
  const agentId = headersList.get("ID");

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

  /* 🔥 JOIN allotcustomers + customers */
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
      {
        $unwind: "$customerInfo",
      },
    ])
    .toArray();

  await client.close();

  return (
    <div className="p-6 w-full h-full space-y-6">

      {/* ================= GUIDE / INSTRUCTIONS ================= */}
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>📢 महत्वपूर्ण जानकारी</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            👉 इस पृष्ठ पर <b>सभी ग्राहक नहीं</b>, बल्कि
            <b> केवल वही ग्राहक दिखाए गए हैं जो इस एजेंट को अलॉट किए गए हैं।</b>
          </p>
          <p>
            👉 यदि कोई ग्राहक यहाँ दिखाई दे रहा है, तो इसका मतलब है कि
            उसकी डिलीवरी की जिम्मेदारी इसी एजेंट की है।
          </p>
          <p>
            👉 <b>Deliver</b> बटन से आप उस ग्राहक की आज की डिलीवरी दर्ज कर सकते हैं।
          </p>
          <p>
            👉 <b>Edit</b> बटन से ग्राहक के अख़बार / अलॉटमेंट में बदलाव किया जा सकता है।
          </p>
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
              अभी इस एजेंट को कोई ग्राहक अलॉट नहीं किया गया है।
            </p>
          ) : (
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>नाम</TableHead>
                  <TableHead>मोबाइल</TableHead>
                  <TableHead>PB</TableHead>
                  <TableHead>BH</TableHead>
                  <TableHead>HT</TableHead>
                  <TableHead>TIMES</TableHead>
                  <TableHead>HINDU</TableHead>
                  <TableHead>स्थिति</TableHead>
                  <TableHead>अलॉट की तारीख</TableHead>
                  <TableHead>डिलीवरी</TableHead>
                  <TableHead>संपादन</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {customers.map((item: any) => (
                  <TableRow key={item._id.toString()}>
                    <TableCell>
                      {item.customerInfo.name}
                    </TableCell>

                    <TableCell>
                      {item.customerInfo.mobile}
                    </TableCell>

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
                        <Button variant="outline">Edit</Button>
                      </Link>
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
