"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

interface AgentProfile {
  full_name: string
  mobile: string
  email: string
  address: string
  state: string
  district: string
  tehsil: string
  village: string
  pincode: string
  agency_name: string
  agency_phone: string
  age: number
  gender: string
  photo?: string
}

export default function AgentProfilePage() {
  const [form, setForm] = useState<AgentProfile | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  /* 🔹 Fetch profile */
  useEffect(() => {
    fetch("/api/agent/profile")
      .then((res) => res.json())
      .then((data) => setForm(data.agent))
  }, [])

  /* 🔹 Upload image to Cloudinary */
  const uploadPhoto = async () => {
    if (!photoFile) return null

    setUploading(true)

    const formData = new FormData()
    formData.append("file", photoFile)
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    )

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    )

    const data = await res.json()
    setUploading(false)

    return data.secure_url as string
  }

  const router = useRouter()

  /* 🔹 Save profile */
  const handleSave = async () => {
    if (!form) return
    setSaving(true)

    let photoUrl  = form.photo as string | null

    if (photoFile) {
      photoUrl = await uploadPhoto()
    }

    await fetch("/api/agent/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, photo: photoUrl }),
    })

    alert("Profile updated")
    setSaving(false)
    router.push("/agent/profile")
  }

  if (!form) return <div className="p-6">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>👤 Edit Agent Profile</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 📸 PHOTO */}
          <div className="flex items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={form.photo} />
              <AvatarFallback>AG</AvatarFallback>
            </Avatar>

            <div>
              <Label>Profile Photo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setPhotoFile(e.target.files?.[0] || null)
                }
              />
            </div>
          </div>

          {/* FORM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Full Name" value={form.full_name}
              onChange={(v) => setForm({ ...form, full_name: v })} />

            <InputField label="Mobile" value={form.mobile}
              onChange={(v) => setForm({ ...form, mobile: v })} />

            <InputField label="Email" value={form.email}
              onChange={(v) => setForm({ ...form, email: v })} />

            <InputField label="Agency Name" value={form.agency_name}
              onChange={(v) => setForm({ ...form, agency_name: v })} />

            <InputField label="Agency Phone" value={form.agency_phone}
              onChange={(v) => setForm({ ...form, agency_phone: v })} />

            <InputField label="Age" type="number" value={form.age}
              onChange={(v) => setForm({ ...form, age: +v })} />

            <InputField label="Gender" value={form.gender}
              onChange={(v) => setForm({ ...form, gender: v })} />

            <InputField label="Pincode" value={form.pincode}
              onChange={(v) => setForm({ ...form, pincode: v })} />
          </div>

          <div>
            <Label>Address</Label>
            <Textarea
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSave}
            disabled={saving || uploading}
          >
            {uploading ? "Uploading Image..." : saving ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

/* 🔹 Small reusable input */
function InputField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: any
  type?: string
  onChange: (v: any) => void
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
