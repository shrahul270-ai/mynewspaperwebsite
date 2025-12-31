import { cookies } from "next/headers"
import { MongoClient, ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface HokerJwtPayload {
  hokerId: string
  role: "hoker"
}

/* ======================
   Mongo
====================== */
const client = new MongoClient(process.env.MONGODB_URI!)

export default async function HokerDeliveries() {
  /* ======================
     Auth
  ====================== */
  const token = (await cookies()).get("token")?.value
  if (!token) {
    return <div className="text-red-500">Unauthorized</div>
  }

  let decoded: HokerJwtPayload
  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as HokerJwtPayload
  } catch {
    return <div className="text-red-500">Invalid token</div>
  }

  /* ======================
     Fetch Deliveries + Customer
  ====================== */
  await client.connect()
  const db = client.db("maindatabase")

  const deliveries = await db
    .collection("hokerDeliveries")
    .aggregate([
      {
        $match: {
          hokerId: new ObjectId(decoded.hokerId),
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { date: -1 },
      },
    ])
    .toArray()

  if (deliveries.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No deliveries found
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Deliveries</h1>

      {deliveries.map((delivery: any) => (
        <Card key={delivery._id.toString()}>
          <CardHeader>
            <CardTitle className="flex flex-col gap-1">
              <span>
                {new Date(delivery.date).toDateString()}
              </span>

              <span className="text-sm font-normal text-muted-foreground">
                Customer:{" "}
                {delivery.customer
                  ? `${delivery.customer.name} ${delivery.customer.surname || ""}`
                  : "Unknown"}
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Newspapers */}
            {delivery.newspapers?.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">
                  Newspapers
                </h3>

                <div className="space-y-2">
                  {delivery.newspapers.map(
                    (paper: any, i: number) => (
                      <div
                        key={i}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {paper.name} ({paper.language})
                        </span>
                        <Badge variant="outline">
                          Qty: {paper.qty}
                        </Badge>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Booklets */}
            {delivery.booklets?.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">
                    Booklets
                  </h3>

                  <div className="space-y-2">
                    {delivery.booklets.map(
                      (booklet: any, i: number) => (
                        <div
                          key={i}
                          className="flex justify-between text-sm"
                        >
                          <span>{booklet.name}</span>
                          <Badge variant="outline">
                            Qty: {booklet.qty}
                          </Badge>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Extra */}
            {delivery.extra && (
              <>
                <Separator />
                <div className="text-sm">
                  <span className="font-medium">
                    Extra:
                  </span>{" "}
                  {delivery.extra.reason} (
                  {delivery.extra.qty})
                </div>
              </>
            )}

            {/* Remarks */}
            {delivery.remarks && (
              <>
                <Separator />
                <div className="text-sm text-muted-foreground">
                  Remarks: {delivery.remarks}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
