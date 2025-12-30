"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "../ui/button"
import Link from "next/link"

interface Item {
  _id: string
  name?: string
  title?: string
}

export default function CustomerAllPapersPage() {
  const [newspapers, setNewspapers] = useState<Item[]>([])
  const [booklets, setBooklets] = useState<Item[]>([])

  const [selectedNewspapers, setSelectedNewspapers] = useState<string[]>([])
  const [selectedBooklets, setSelectedBooklets] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/customers/newspapers")
        const data = await res.json()

        setNewspapers(data.newspapers || [])
        setBooklets(data.booklets || [])
        setSelectedNewspapers(data.selectedNewspapers || [])
        setSelectedBooklets(data.selectedBooklets || [])
      } catch (err) {
        console.error("Fetch error", err)
      }
    }

    fetchData()
  }, [])

  const filterSelected = (items: Item[], selected: string[]) =>
    items.filter((item) => selected.includes(item._id))

  return (
    <div className=" p-6 space-y-6">
      {/* 📰 Newspapers */}
      <div className="flex justify-end">
        <Link href="/customer/add-newspaper"> <Button>Add Newspaper</Button></Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My Newspapers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filterSelected(newspapers, selectedNewspapers).map(
                (item, index) => (
                  <TableRow key={item._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {item.name || "Unnamed"}
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 📘 Booklets */}
      <Card>
        <CardHeader>
          <CardTitle>My Booklets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Title</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filterSelected(booklets, selectedBooklets).map(
                (item, index) => (
                  <TableRow key={item._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {item.title || item.name || "Untitled"}
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
