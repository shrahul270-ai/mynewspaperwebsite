'use client'
import { Button } from '@/components/ui/button'
import { redirect, useRouter } from 'next/navigation'
import React from 'react'

export default function Page() {
  const router = useRouter()
  redirect("/index.html")


}


