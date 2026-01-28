"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
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
import { Loader2, Trash2, AlertTriangle } from "lucide-react"

interface Booklet {
  _id: string
  title: string
  price: number
  description: string
  status: "active" | "inactive"
}

export default function EditBookletPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [form, setForm] = useState<Booklet | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  /* 📥 Fetch booklet */
  useEffect(() => {
    if (!id) return

    fetch(`/api/admin/booklets/${id}`)
      .then((res) => res.json())
      .then((data) => setForm(data))
  }, [id])

  /* ✏️ Update booklet */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    setLoading(true)

    try {
      const res = await fetch(`/api/admin/booklets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          price: form.price,
          description: form.description,
          status: form.status,
        }),
      })

      if (res.ok) {
        // Optional: Show success message
        // toast.success("Booklet updated successfully")
        router.push("/admin/booklets")
      } else {
        const error = await res.json()
        console.error("Update error:", error)
        // toast.error(error.message || "Failed to update booklet")
      }
    } catch (error) {
      console.error("Update error:", error)
      // toast.error("An error occurred while updating")
    } finally {
      setLoading(false)
    }
  }

  /* 🗑️ Delete booklet */
  const handleDelete = async () => {
    if (!form) return

    setDeleting(true)
    
    try {
      const res = await fetch(`/api/admin/booklets/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      const data = await res.json()

      if (res.ok) {
        // Optional: Show success message
        // toast.success("Booklet deleted successfully")
        router.push("/admin/booklets")
      } else {
        console.error("Delete error:", data)
        // toast.error(data.message || "Failed to delete booklet")
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
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Booklet</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Price *</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: Number(e.target.value),
                  })
                }
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
                rows={4}
              />
            </div>

            <div>
              <Label>Status *</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    status: value as "active" | "inactive",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => router.push("/admin/booklets")}
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
                  "Update Booklet"
                )}
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="border-t pt-6">
          <div className="w-full">
            <p className="text-sm text-muted-foreground mb-3 font-medium">
              Danger Zone
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Booklet
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Delete Booklet
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the booklet
                    <span className="font-semibold mx-1">"{form.title}"</span>
                    and remove it from the database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>
                    Cancel
                  </AlertDialogCancel>
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
                      "Delete Booklet"
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