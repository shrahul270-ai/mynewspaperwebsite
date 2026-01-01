import Link from "next/link"
import { XCircle, Mail, ArrowLeft } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AgentRejectedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="max-w-md w-full text-center shadow-lg">
        <CardContent className="p-8 space-y-5">
          {/* Icon */}
          <div className="flex justify-center">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold">
            Application Rejected
          </h1>

          {/* Message */}
          <p className="text-muted-foreground text-sm leading-relaxed">
            We’re sorry, but your agent application was not approved at this
            time.
            <br />
            This can happen if the submitted details were incomplete or did not
            meet our verification criteria.
          </p>

          <p className="text-xs text-muted-foreground">
            You may contact support or reapply with correct information.
          </p>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Link href="/signup/agent">
              <Button className="w-full">
                Reapply as Agent
              </Button>
            </Link>
            <div className="my-2"></div>
            <Link href="mailto:shrahul270@gmail.com">
              <Button variant="outline" className="w-full flex gap-2">
                <Mail className="w-4 h-4" />
                Contact Support
              </Button>
            </Link>
            <div className="my-2"></div>


            <Link href="/login">
              <Button
                variant="ghost"
                className="w-full flex gap-2 text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
