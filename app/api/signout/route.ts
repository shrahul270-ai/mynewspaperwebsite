import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(
    new URL("/", request.url)
  )

  response.cookies.set({
    name: "token",
    value: "",
    path: "/",
    maxAge: 0, // 👈 cookie delete
  })

  return response
}
