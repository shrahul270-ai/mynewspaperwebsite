import { ObjectId } from "mongodb"


export interface CustomerSubscription {
  _id?: ObjectId

  customerId: ObjectId        // 🔗 customers collection reference

  newspapers: ObjectId[]      // selected newspapers
  booklets: ObjectId[]        // selected booklets

  createdAt?: Date
  updatedAt?: Date
}


export interface CustomerJwtPayload {
  customerId: string
  role: string
}

export interface HokerDelivery {
  _id: ObjectId

  // 🔗 Relations
  customerId: ObjectId
  hokerId: ObjectId
  agentId: ObjectId

  // 📅 Date
  date: Date

  // 🗞 Newspaper Delivery
  newspaperDelivered: boolean
  newspaperQty: number

  // 📘 Booklet Delivery
  bookletDelivered?: boolean
  bookletQty?: number

  // ➕ Extra Delivery (special case)
  extraDelivery?: boolean
  extraReason?: string
  extraQty?: number

  // 🧾 Meta
  remarks?: string
  created_at: Date
}
