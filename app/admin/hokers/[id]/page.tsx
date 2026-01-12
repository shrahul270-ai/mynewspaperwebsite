"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

/* ================= TYPES ================= */

interface Hoker {
  _id: string
  full_name: string
  email: string
  mobile: string
  address: string
  state: string
  district: string
  tehsil: string
  village: string
  pincode: string
  age: string
  gender: string
}

/* ================= PAGE ================= */

export default function EditHokerPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [form, setForm] = useState<Hoker | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  /* ================= GET HOKER ================= */

  useEffect(() => {
    if (!id) return

    async function fetchHoker() {
      try {
        const res = await fetch(`/api/admin/hokers/${id}`)
        const data = await res.json()

        if (!res.ok || !data.success) {
          alert(data.message || "Failed to load hoker")
          return
        }

        setForm(data.data)
      } catch (err) {
        console.error(err)
        alert("Server error")
      }
    }

    fetchHoker()
  }, [id])

  /* ================= CHANGE ================= */

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!form) return
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  /* ================= SAVE ================= */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return

    setLoading(true)

    try {
      const res = await fetch(`/api/admin/hokers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        alert(data.message || "Update failed")
      } else {
        alert("Hoker updated successfully ✅")
        router.push("/admin/hokers")
      }
    } catch (err) {
      console.error(err)
      alert("Server error")
    } finally {
      setLoading(false)
    }
  }

  /* ================= DELETE ================= */

  async function handleDelete() {
    if (!id) return

    const ok = confirm(
      "Are you sure you want to delete this hoker? This action cannot be undone."
    )
    if (!ok) return

    setDeleting(true)

    try {
      const res = await fetch(`/api/admin/hokers/${id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        alert(data.message || "Delete failed")
      } else {
        alert("Hoker deleted successfully 🗑️")
        router.push("/admin/hokers")
      }
    } catch (err) {
      console.error(err)
      alert("Server error")
    } finally {
      setDeleting(false)
    }
  }

  /* ================= UI ================= */

  if (!form) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Edit Hoker</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <InputField label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} />
        <InputField label="Email" name="email" value={form.email} onChange={handleChange} />
        <InputField label="Mobile" name="mobile" value={form.mobile} onChange={handleChange} />
        <InputField label="Age" name="age" value={form.age} onChange={handleChange} />
        <InputField label="Gender" name="gender" value={form.gender} onChange={handleChange} />
        <InputField label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} />

        <div className="md:col-span-2">
          <Label>Address</Label>
          <Input
            name="address"
            value={form.address}
            onChange={handleChange}
          />
        </div>

        <InputField label="Village" name="village" value={form.village} onChange={handleChange} />
        <InputField label="Tehsil" name="tehsil" value={form.tehsil} onChange={handleChange} />
        <InputField label="District" name="district" value={form.district} onChange={handleChange} />
        <InputField label="State" name="state" value={form.state} onChange={handleChange} />

        <div className="md:col-span-2 flex flex-wrap justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Hoker"}
          </Button>
        </div>
      </form>
    </div>
  )
}

/* ================= SMALL COMPONENT ================= */

function InputField({
  label,
  name,
  value,
  onChange,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input name={name} value={value} onChange={onChange} />
    </div>
  )
}
