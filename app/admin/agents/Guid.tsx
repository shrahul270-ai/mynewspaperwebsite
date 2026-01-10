"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function AgentsGuide() {
  const [lang, setLang] = useState<"en" | "hi">("en")

  return (
    <div className="rounded-lg border bg-muted/40 p-4 text-sm space-y-2">
      {/* Header + Toggle */}
      <div className="flex items-center justify-between">
        <p className="font-medium">
          👋 {lang === "en" ? "How to use" : "कैसे उपयोग करें"}
        </p>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setLang(lang === "en" ? "hi" : "en")}
        >
          {lang === "en" ? "हिंदी" : "English"}
        </Button>
      </div>

      {/* Content */}
      {lang === "en" ? (
        <ul className="list-disc pl-4 text-muted-foreground space-y-1">
          <li>Click avatar to view full photo</li>
          <li>Search agent by name, email or mobile</li>
          <li>Status shows approval state</li>
          <li>Edit to review agent details</li>
        </ul>
      ) : (
        <ul className="list-disc pl-4 text-muted-foreground space-y-1">
          <li>पूरा फोटो देखने के लिए अवतार पर क्लिक करें</li>
          <li>नाम, ईमेल या मोबाइल से एजेंट खोजें</li>
          <li>स्टेटस से अप्रूवल की स्थिति दिखती है</li>
          <li>एजेंट की जानकारी देखने के लिए Edit करें</li>
        </ul>
      )}
    </div>
  )
}
