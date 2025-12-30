'use client'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

export default function Page() {
    const router = useRouter()
    useEffect(()=>{
        router.push("/agent/profile")
    }, [])
  return (
    <div>Loading ...</div>
  )
}
