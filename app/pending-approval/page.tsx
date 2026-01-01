import { CheckCircle, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AgentPendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-center">
            <Clock className="w-14 h-14 text-yellow-500" />
          </div>

          <h1 className="text-2xl font-bold">
            Approval Pending
          </h1>

          <p className="text-muted-foreground">
            Your agent account has been successfully created.
            <br />
            Please wait while our admin reviews and approves your profile.
          </p>

          <p className="text-sm text-muted-foreground">
            Once approved, you will be able to access your dashboard.
          </p>

          <div className="pt-2">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Back to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
