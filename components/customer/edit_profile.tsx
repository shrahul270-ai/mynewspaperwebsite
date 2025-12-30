'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CustomerProfile {
  name: string
  surname: string
  mobile: string
  email: string
  address: string
  state: string
  district: string
  tehsil: string
  village: string
  pincode: string
  age: number
  gender: "male" | "female" | "other"
  photo?: string
}

export default function CustomerEditProfilePage() {
  const [form, setForm] = useState<CustomerProfile | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  /* 🔹 Load profile */
  useEffect(() => {
    fetch("/api/customers/profile")
      .then(res => res.json())
      .then(data => {
        setForm(data.customer)
        setLoading(false)
      })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    setSaving(true)

    const fd = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      if (value !== undefined && key !== "photo") {
        fd.append(key, String(value))
      }
    })

    if (photoFile) {
      fd.append("photo", photoFile)
    }

    await fetch("/api/customers/profile", {
      method: "PUT",
      body: fd,
    })

    setSaving(false)
    alert("Profile updated successfully")
  }

  if (loading || !form) {
    return <div className="p-6">Loading profile...</div>
  }

  return (
    <div className="">
      <Card className="bg-transparent">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Photo */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={
                    photoFile
                      ? URL.createObjectURL(photoFile)
                      : form.photo
                  }
                />
                <AvatarFallback>
                  {form.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <Input
                type="file"
                accept="image/*"
                onChange={e => setPhotoFile(e.target.files?.[0] || null)}
              />
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input name="name" value={form.name} onChange={handleChange} />
              </div>
              <div>
                <Label>Surname</Label>
                <Input name="surname" value={form.surname} onChange={handleChange} />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mobile</Label>
                <Input name="mobile" value={form.mobile} onChange={handleChange} />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" value={form.email} onChange={handleChange} />
              </div>
            </div>

            {/* Address */}
            <div>
              <Label>Address</Label>
              <Input name="address" value={form.address} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input name="state" value={form.state} onChange={handleChange} placeholder="State" />
              <Input name="district" value={form.district} onChange={handleChange} placeholder="District" />
              <Input name="tehsil" value={form.tehsil} onChange={handleChange} placeholder="Tehsil" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input name="village" value={form.village} onChange={handleChange} placeholder="Village" />
              <Input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" />
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Age</Label>
                <Input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Gender</Label>
                <Select
                  value={form.gender}
                  onValueChange={val =>
                    setForm({ ...form, gender: val as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Saving..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
