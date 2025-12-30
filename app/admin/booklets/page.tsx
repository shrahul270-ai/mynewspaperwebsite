'use client'

import { useEffect, useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Booklet {
  _id: string
  title: string
  price: number
  description: string
  status: "active" | "inactive"
  created_at: string
}

export default function BookletsPage() {
  const [booklets, setBooklets] = useState<Booklet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchBooklets = async () => {
      try {
        const res = await fetch("/api/admin/booklets")
        const data = await res.json()

        if (!res.ok) {
          setError(data.message || "Failed to load booklets")
        } else {
          setBooklets(data.booklets)
        }
      } catch {
        setError("Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchBooklets()
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Booklets</h1>

        <Button asChild>
          <Link href="/admin/add-booklet">+ Add Booklet</Link>
        </Button>
      </div>

      {/* Content */}
      {booklets.length === 0 ? (
        <p className="text-muted-foreground">No booklets found</p>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {booklets.map((b) => (
                  <TableRow key={b._id}>
                    <TableCell className="font-medium">
                      {b.title}
                    </TableCell>

                    <TableCell>₹{b.price}</TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          b.status === "active"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {b.status}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {new Date(b.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
