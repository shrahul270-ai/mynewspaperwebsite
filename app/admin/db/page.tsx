import { MongoClient } from "mongodb"

const client = new MongoClient(process.env.MONGODB_URI!)

export default async function DatabasePage() {
  await client.connect()
  const db = client.db("maindatabase")
  const collections = await db.collections()

  const data: Record<string, any[]> = {}

  for (const col of collections) {
    data[col.collectionName] = await col.find({}).toArray()
  }

  await client.close()

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📦 Database Viewer</h1>

        {/* Download Button */}
        <a
          href="/api/admin/export-db"
          className="px-4 py-2 bg-black text-white rounded-md text-sm"
        >
          Download JSON
        </a>
      </div>

      {/* Data View */}
      {Object.entries(data).map(([collection, docs]) => (
        <div key={collection} className="border rounded-lg p-4">
          <h2 className="font-semibold text-lg mb-2">
            📁 {collection} ({docs.length})
          </h2>

          <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-[400px]">
            {JSON.stringify(docs, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  )
}
