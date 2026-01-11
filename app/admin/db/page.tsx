import { MongoClient } from "mongodb"
import DatabaseViewer from "./DatabaseViewer"

const client = new MongoClient(process.env.MONGODB_URI!)

export default async function DatabasePage() {
  await client.connect()
  const db = client.db("maindatabase")

  const collections = (await db.collections()).map(
    (c) => c.collectionName
  )

  await client.close()

  return <DatabaseViewer collections={collections} />
}
