import { MongoClient, ObjectId } from "mongodb"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import Link from "next/link"
import { HokerDelivery } from "@/lib/models"

// import { HokerDelivery } from "@/types/models"

interface CustomerJwtPayload {
  customerId: string
  role: "customer"
}

export default async function CustomerCalendarPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string }
}) {
  /* =====================
     🔐 AUTH
  ===================== */
  const token = (await cookies()).get("token")?.value
  if (!token) return <div className="p-4">Unauthorized</div>

  let decoded: CustomerJwtPayload
  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as CustomerJwtPayload
  } catch {
    return <div className="p-4">Invalid Token</div>
  }

  const customerId = decoded.customerId

  /* =====================
     📅 MONTH LOGIC
  ===================== */
  const now = new Date()
  const month = searchParams.month
    ? Number(searchParams.month)
    : now.getMonth() + 1
  const year = searchParams.year
    ? Number(searchParams.year)
    : now.getFullYear()

  const firstDate = new Date(year, month - 1, 1)
  const firstDay = firstDate.getDay()
  const daysInMonth = new Date(year, month, 0).getDate()

  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 1)

  /* =====================
     📦 DATABASE
  ===================== */
  const client = new MongoClient(process.env.MONGODB_URI!)
  await client.connect()
  const db = client.db("maindatabase")

  const deliveries = (await db
    .collection("hokerDeliveries")
    .find({
      customerId: new ObjectId(customerId),
      date: { $gte: monthStart, $lt: monthEnd },
    })
    .toArray()) as HokerDelivery[]

  await client.close()

  /* =====================
     🗺 DATE → STATUS MAP
  ===================== */
  const dateStatusMap = new Map<string, boolean>()

  deliveries.forEach(delivery => {
    const dateKey = new Date(delivery.date)
      .toISOString()
      .split("T")[0]

    const hasNewspaper =
      delivery.newspapers?.some(n => n.qty > 0)

    const hasBooklet =
      delivery.booklets?.some(b => b.qty > 0)

    const hasExtra =
      delivery.extra && delivery.extra.qty > 0

    if (hasNewspaper || hasBooklet || hasExtra) {
      dateStatusMap.set(dateKey, true)
    }
  })

  /* =====================
     📊 STATS
  ===================== */
  const newspaperDeliveries = deliveries.filter(
    d => d.newspapers?.some(n => n.qty > 0)
  ).length

  const bookletDeliveries = deliveries.filter(
    d => d.booklets?.some(b => b.qty > 0)
  ).length

  const extraDeliveries = deliveries.filter(
    d => d.extra && d.extra.qty > 0
  ).length

  /* =====================
     🗓 CALENDAR GRID
  ===================== */
  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  /* =====================
     ⏮ ⏭ NAVIGATION
  ===================== */
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year

  /* =====================
     🧱 UI
  ===================== */
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/customer/calendar?month=${prevMonth}&year=${prevYear}`}
          className="text-blue-600"
        >
          ← Prev
        </Link>

        <h1 className="text-xl font-semibold">
          {firstDate.toLocaleString("default", { month: "long" })} {year}
        </h1>

        <Link
          href={`/customer/calendar?month=${nextMonth}&year=${nextYear}`}
          className="text-blue-600"
        >
          Next →
        </Link>
      </div>

      {/* Calendar */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => (
          <div key={day} className="font-medium text-gray-500">
            {day}
          </div>
        ))}

        {days.map((day, idx) => {
          if (!day) return <div key={idx} />

          const dateKey = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`
          const delivered = dateStatusMap.has(dateKey)

          const isToday =
            day === new Date().getDate() &&
            month === new Date().getMonth() + 1 &&
            year === new Date().getFullYear()

          return (
            <div
              key={idx}
              className={`h-12 rounded-lg flex items-center justify-center
                ${delivered ? "bg-green-500 text-white" : "bg-gray-100"}
                ${isToday ? "ring-2 ring-blue-500" : ""}
              `}
            >
              {day}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      {deliveries.length > 0 && (
        <div className="p-4 rounded-lg bg-blue-50">
          <h3 className="font-medium mb-3">Delivery Summary</h3>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {newspaperDeliveries}
              </div>
              <p className="text-sm">Newspaper Days</p>
            </div>

            <div>
              <div className="text-2xl font-bold text-blue-600">
                {bookletDeliveries}
              </div>
              <p className="text-sm">Booklet Days</p>
            </div>

            <div>
              <div className="text-2xl font-bold text-purple-600">
                {extraDeliveries}
              </div>
              <p className="text-sm">Extra Days</p>
            </div>
          </div>

          <p className="mt-3 text-center text-sm">
            Total Delivery Days: {dateStatusMap.size}
          </p>
        </div>
      )}
    </div>
  )
}
