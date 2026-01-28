"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner" // या आपके UI library का toast

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Newspaper {
  _id: string
  name: string
  language: string
  price: {
    monday: number | string
    tuesday: number | string
    wednesday: number | string
    thursday: number | string
    friday: number | string
    saturday: number | string
    sunday: number | string
  }
}

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
]

export default function EditNewspaperPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [form, setForm] = useState<Newspaper | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  /* 📥 Fetch Newspaper */
  useEffect(() => {
    if (!id) return

    fetch(`/api/admin/newspapers/${id}`)
      .then((res) => res.json())
      .then((data) => setForm(data))
  }, [id])

  /* ✏️ Update Newspaper */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    setLoading(true)

    try {
      const res = await fetch(`/api/admin/newspapers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          language: form.language,
          price: {
            monday: Number(form.price.monday),
            tuesday: Number(form.price.tuesday),
            wednesday: Number(form.price.wednesday),
            thursday: Number(form.price.thursday),
            friday: Number(form.price.friday),
            saturday: Number(form.price.saturday),
            sunday: Number(form.price.sunday),
          },
        }),
      })

      if (res.ok) {
        // toast.success("Newspaper updated successfully")
        router.push("/admin/newspapers")
      } else {
        const error = await res.json()
        // toast.error(error.message || "Failed to update newspaper")
        console.error("Update error:", error)
      }
    } catch (error) {
      console.error("Update error:", error)
      // toast.error("An error occurred while updating")
    } finally {
      setLoading(false)
    }
  }

  /* 🗑️ Delete Newspaper */
  const handleDelete = async () => {
    if (!form) return

    setDeleting(true)
    
    try {
      const res = await fetch(`/api/admin/newspapers/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      const data = await res.json()

      if (res.ok) {
        // toast.success("Newspaper deleted successfully")
        router.push("/admin/newspapers")
      } else {
        // toast.error(data.message || "Failed to delete newspaper")
        console.error("Delete error:", data)
      }
    } catch (error) {
      console.error("Delete error:", error)
      // toast.error("An error occurred while deleting")
    } finally {
      setDeleting(false)
    }
  }

  if (!form) {
    return (
      <div className="flex justify-center mt-10">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Newspaper</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
              />
            </div>

            {/* Language */}
            <div>
              <Label>Language</Label>
              <Input
                value={form.language}
                onChange={(e) =>
                  setForm({ ...form, language: e.target.value })
                }
                required
              />
            </div>

            {/* Prices */}
            <div className="space-y-3">
              <Label>Price per Day (₹)</Label>

              <div className="grid grid-cols-2 gap-3">
                {DAYS.map((day) => (
                  <div key={day.key}>
                    <Label className="text-sm">{day.label}</Label>
                    <Input
                      type="number"
                      value={form.price[day.key as keyof typeof form.price]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          price: {
                            ...form.price,
                            [day.key]: e.target.value,
                          },
                        })
                      }
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => router.push("/admin/newspapers")}
              >
                Cancel
              </Button>
              
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Newspaper"
                )}
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="border-t pt-6">
          <div className="w-full">
            <p className="text-sm text-muted-foreground mb-3">
              Danger Zone
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Newspaper
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the newspaper 
                    <span className="font-semibold"> "{form.name}"</span> from the database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Yes, delete newspaper"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}