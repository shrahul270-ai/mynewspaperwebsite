"use server";

import { MongoClient, ObjectId } from "mongodb";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cookies, headers } from "next/headers";
import { Button } from "../ui/button";
import Link from "next/link";

/* ================== CONFIG ================== */

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = "maindatabase";

/* ================== PAGE ================== */

export default async function AgentProfile() {
  const cookiesStored = await cookies()
  const header = await headers()

  // ⚠️ demo ke liye static id
  const AGENT_ID = header.get("ID") as string;

  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  const db = client.db(DB_NAME);
  const agent = await db.collection("agents").findOne({
    _id: new ObjectId(AGENT_ID),
  });

  await client.close();

  if (!agent) {
    return (
      <div className="p-6 text-center text-sm opacity-70">
        Agent profile not found
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* ================= HEADER ================= */}
      <Card>
        <CardContent className="">
          <div className="flex justify-between">
            <div className="left flex items-center gap-6 pt-6">

              <Image
                src={agent.photo}
                alt="Agent Photo"
                width={120}
                height={120}
                className="rounded-full border aspect-square"
              />

              <div className="space-y-1">
                <h1 className="text-2xl font-semibold">{agent.full_name}</h1>
                <p className="text-sm opacity-70">{agent.email}</p>
                <p className="text-sm opacity-70">{agent.mobile}</p>
              </div>
            </div>
            <div className="right flex items-center gap-6 pt-6">
              <Link href={"/agent/edit-profile"}>
            <Button >Edit Profile</Button>
              </Link>
            </div>

          </div>

        </CardContent>
      </Card>

      {/* ================= PERSONAL INFO ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <p><b>Age:</b> {agent.age}</p>
          <p><b>Gender:</b> {agent.gender}</p>
          <p><b>State:</b> {agent.state}</p>
          <p><b>District:</b> {agent.district}</p>
          <p><b>Tehsil:</b> {agent.tehsil}</p>
          <p><b>Village:</b> {agent.village}</p>
          <p><b>Pincode:</b> {agent.pincode}</p>
        </CardContent>
      </Card>

      {/* ================= ADDRESS ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {agent.address}
        </CardContent>
      </Card>

      {/* ================= AGENCY INFO ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Agency Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><b>Agency Name:</b> {agent.agency_name}</p>
          <p><b>Agency Phone:</b> {agent.agency_phone}</p>
        </CardContent>
      </Card>

      <Separator />

      {/* ================= META ================= */}
      <p className="text-xs text-center opacity-60">
        Profile Created At:{" "}
        {new Date(agent.created_at).toLocaleDateString()}
      </p>

    </div>
  );
}
