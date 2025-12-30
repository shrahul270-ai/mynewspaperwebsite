import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { MongoClient, ObjectId } from "mongodb"

import * as jwt from "jsonwebtoken"
// import { AgentJwtPayload } from "@/lib/models"


export interface AdminJwtPayload {
  adminId: string
  role: string
}

/* =====================
   MongoDB
===================== */
const client = new MongoClient(process.env.MONGODB_URI!)

/* =====================
   POST: Add Newspaper
===================== */
export async function POST(req: NextRequest) {
    try {
        // 🔐 Agent ID from headers
        const token = req.cookies.get("token")?.value
        if (!token) {
            return NextResponse.json(
                { success: false, message: "Agent not authorized" },
                { status: 401 }
            )
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET!) as AdminJwtPayload
        const adminId =  decoded.adminId


        if (!adminId) {
            return NextResponse.json(
                { success: false, message: "Agent not authorized" },
                { status: 401 }
            )
        }

        // 📦 Body
        const { name, price, language } = await req.json()

        if (!name || !price || !language) {
            return NextResponse.json(
                { success: false, message: "All fields are required" },
                { status: 400 }
            )
        }

        await client.connect()
        const db = client.db("maindatabase")
        const newspapers = db.collection("newspapers")

    //    const agentObjectId = new ObjectId(agentId)

        // 📰 Insert
        await newspapers.insertOne({
            name,
            price: Number(price),
            language,
            // "agentId":agentObjectId,
            created_at: new Date(),
        })

        return NextResponse.json({
            success: true,
            message: "Newspaper added successfully",
        })
    } catch (error) {
        console.error("Add newspaper error:", error)

        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        )
    }
}
