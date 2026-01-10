"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function CustomerGuid() {
  const [lang, setLang] = useState<"en" | "hi">("en")

  return (
    <div className="rounded-lg border bg-muted/40 p-4 text-sm space-y-2">
      {/* Header + Toggle */}
      <div className="flex items-center justify-between">
        <p className="font-medium">
          👋 {lang === "en" ? "Admin Guide" : "एडमिन गाइड"}
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
          <li>Click customer avatar to view full photo</li>
          <li>Search customers by name, email or mobile</li>
          <li>Edit button opens customer details</li>
          <li>Latest customers appear on top</li>
        </ul>
      ) : (
        <ul className="list-disc pl-4 text-muted-foreground space-y-1">
          <li>पूरा फोटो देखने के लिए कस्टमर अवतार पर क्लिक करें</li>
          <li>नाम, ईमेल या मोबाइल से कस्टमर खोजें</li>
          <li>Edit बटन से कस्टमर की जानकारी खोलें</li>
          <li>नए कस्टमर सबसे ऊपर दिखते हैं</li>
        </ul>
      )}
    </div>
  )
}
