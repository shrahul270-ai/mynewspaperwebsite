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
          from: "customers",           // 👈 customers collection
          localField: "customer",      // 👈 allotedcustomers.customer
          foreignField: "_id",          // 👈 customers._id
          as: "customerInfo",
        },
      },
      {
        $unwind: "$customerInfo",      // 👈 array → object
      },
    ])
    .toArray();

  await client.close();

  return (
    <div className="p-6 w-full h-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Allotted Customers</CardTitle>
        </CardHeader>

        <CardContent className="w-full overflow-x-auto">
          {customers.length === 0 ? (
            <p className="text-sm opacity-70 text-center">
              No customers allotted
            </p>
          ) : (
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>PB</TableHead>
                  <TableHead>BH</TableHead>
                  <TableHead>HT</TableHead>
                  <TableHead>TIMES</TableHead>
                  <TableHead>HINDU</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Allotted On</TableHead>
                  <TableHead>Deliver</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {customers.map((item: any) => (
                  <TableRow key={item._id.toString()}>
                    {/* 🔥 CUSTOMER INFO */}
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
                      <a
                        href={`/agent/add-delivery?id=${item.customer}`}
                      >
                        <Button>Deliver</Button>
                      </a>
                    </TableCell>
                     <TableCell>
                      <a
                        href={`/agent/edit-allotment?id=${item.customer}`}
                      >
                        <Button>Edit</Button>
                      </a>
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
