import { MongoClient } from "mongodb"
import DatabaseViewer from "./DatabaseViewer"

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

  return <DatabaseViewer data={data} />
}
