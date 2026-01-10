"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function HokerAdminGuide() {
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
          <li>Click hoker avatar to view full photo</li>
          <li>Search by name, mobile, email or village</li>
          <li>Edit button opens hoker details</li>
          <li>Latest hokers appear on top</li>
        </ul>
      ) : (
        <ul className="list-disc pl-4 text-muted-foreground space-y-1">
          <li>पूरा फोटो देखने के लिए होकर के अवतार पर क्लिक करें</li>
          <li>नाम, मोबाइल, ईमेल या गांव से होकर खोजें</li>
          <li>Edit बटन से होकर की जानकारी खोलें</li>
          <li>नए होकर सबसे ऊपर दिखते हैं</li>
        </ul>
      )}
    </div>
  )
}
