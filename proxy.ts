import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jwt from 'jsonwebtoken'
import { redirect } from 'next/dist/server/api-utils'
import { URL } from 'url'


interface JWT {
  role: string,
  agentId?: string,
  customerId?: string
}

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  console.warn(request.url)
  console.log("I am middleware ")
  const ck = request.cookies
  const token = ck.get("token")?.value
  const secrate = process.env.JWT_SECRET!;


  const dashboard = request.url.split("/")[3]
  // console.log(dashboard)

  const pathname = new URL(request.url).pathname

  let decoded: JWT;

  if (token) {
    decoded = await jwt.verify(token, secrate) as JWT
    const role = await decoded.role

    console.log(decoded)

    if (role == "admin") {
      if(dashboard != "admin"){
        return NextResponse.redirect( new URL('/login/admin', request.url))
      }
      const response = NextResponse.next()
      response.headers.set("url", request.url)
      response.headers.set("ID", decoded.agentId!)
      return response

    }



    if (role == "agent") {
      console.log("I am Agent")
      if (dashboard != "agent") {
        return NextResponse.redirect(new URL('/login/customer', request.url))
      }
      const response = NextResponse.next()
      response.headers.set("url", request.url)
      response.headers.set("ID", decoded.agentId!)

      return response
    }
    else {
      console.log("I am Customer")

      if (dashboard !== "customer") {
        return NextResponse.redirect(
          new URL("/login/customer", request.url)
        )
      }

      const response = NextResponse.next()
      response.headers.set("ID", decoded.customerId!)
      return response
    }

  }
  else {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL('/login/admin', request.url))
    }
    else if (pathname.startsWith("/agent")) {
      return NextResponse.redirect(new URL('/login/agent', request.url))

    }
    else
      return NextResponse.redirect(new URL('/login/customer', request.url))
  }


  //return NextResponse.redirect(new URL('/login/agent', request.url))
}

// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }

export const config = {
  matcher: [
    "/agent/:path*",
    "/customer/:path*",
    "/admin/:path*",
  ],
}
