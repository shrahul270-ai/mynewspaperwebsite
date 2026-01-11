"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Phone, MapPin, Star, Loader2, X, AlertCircle, Clock } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/* =====================
   Hoker Interface
===================== */
interface Hoker {
  _id: string
  full_name: string
  mobile: string
  address: string
  state: string
  district: string
  tehsil: string
  village: string
  pincode: string
  photo?: string
  agent: string
}

const AI_TEXTS = [
  "Analyzing your location…",
  "Matching nearby delivery partners…",
  "Optimizing best choice for you…",
  "Almost done…",
]

export default function CustomerSelectHokerPage() {
  const [recommended, setRecommended] = useState<Hoker[]>([])
  const [others, setOthers] = useState<Hoker[]>([])
  const [loading, setLoading] = useState(true)
  const [aiIndex, setAiIndex] = useState(0)
  const [selectedHoker, setSelectedHoker] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [autoSelectTimer, setAutoSelectTimer] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(15)

  const router = useRouter()

  /* =====================
     Auto-select timer for recommended hoker
  ===================== */
  useEffect(() => {
    if (recommended.length > 0 && timeLeft > 0 && !selectedHoker) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            // Auto-select the first recommended hoker
            if (recommended[0]) {
              handleSelectHoker(recommended[0])
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)

      setAutoSelectTimer(timer as any)

      return () => clearInterval(timer)
    }
  }, [recommended, selectedHoker])

  /* =====================
     Start AI Loading after intro
  ===================== */
  useEffect(() => {
    if (!showIntro) {
      const interval = setInterval(() => {
        setAiIndex((i) => (i + 1) % AI_TEXTS.length)
      }, 1200)

      const timer = setTimeout(() => {
        clearInterval(interval)
        fetchHokers()
      }, 5000)

      return () => {
        clearInterval(interval)
        clearTimeout(timer)
      }
    }
  }, [showIntro])

  const fetchHokers = async () => {
    try {
      const res = await fetch("/api/customer/select-agent")
      const data = await res.json()
      setRecommended(data.recommended || [])
      setOthers(data.others || [])
    } catch {
      toast.error("Failed to load hokers")
    } finally {
      setLoading(false)
    }
  }

  /* =====================
     Select Hoker
  ===================== */
  const handleSelectHoker = async (hoker: Hoker) => {
    if (selectedHoker) return
    setSubmitting(true)

    // Clear auto-select timer if user manually selects
    if (autoSelectTimer) {
      clearInterval(autoSelectTimer)
    }

    try {
      const res = await fetch("/api/customer/select-agent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: hoker.agent,
          hokerId: hoker._id,
        }),
      })

      if (!res.ok) {
        toast.error("Unable to select hoker")
        return
      }

      setSelectedHoker(hoker._id)
      toast.success("Best hoker selected 🎉")
      router.push("/customer/add-newspaper")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  /* =====================
     Introduction Dialog
  ===================== */
  if (showIntro) {
    return (
  <Dialog open={showIntro} onOpenChange={setShowIntro}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <div className="flex items-center justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3">
            <AlertCircle className="h-8 w-8 text-primary" />
          </div>
        </div>

        <DialogTitle className="text-center text-xl">
          🎯 अपना डिलीवरी पार्टनर चुनें
        </DialogTitle>

        <DialogDescription className="text-center pt-2">
          कृपया नीचे दी गई जानकारी ध्यान से पढ़ें
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Nearest */}
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-100 p-1 mt-0.5">
            <MapPin className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium">
              निकटतम होकर का चयन
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              आपको अपने सबसे नज़दीकी होकर का चयन करना होगा, 
              जिससे आपकी अख़बार डिलीवरी समय पर और भरोसेमंद तरीके से हो सके।
            </p>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-green-100 p-1 mt-0.5">
            <Star className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <h4 className="font-medium">
              AI आधारित सुझाव
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              हमारा सिस्टम आपके स्थान के आधार पर 
              आपके लिए सबसे उपयुक्त होकर की सिफ़ारिश करेगा। 
              आप चाहें तो उसी को चुन सकते हैं या कोई अन्य विकल्प भी देख सकते हैं।
            </p>
          </div>
        </div>

        {/* Auto Select */}
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-amber-100 p-1 mt-0.5">
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <h4 className="font-medium">
              स्वचालित चयन
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              यदि आप 15 सेकंड के भीतर कोई चयन नहीं करते हैं, 
              तो सिस्टम स्वतः ही सुझाए गए सर्वश्रेष्ठ होकर को चुन लेगा।
            </p>
          </div>
        </div>

        {/* Tip */}
        <div className="rounded-lg bg-primary/5 p-4 mt-4">
          <p className="text-sm text-center font-medium">
            💡 <span className="text-primary">सुझाव:</span> 
            सिस्टम द्वारा सुझाया गया होकर आमतौर पर 
            तेज़ और बेहतर डिलीवरी के लिए सबसे उपयुक्त होता है।
          </p>
        </div>
      </div>

      <DialogFooter className="flex-col sm:flex-col gap-2">
        <Button
          onClick={() => setShowIntro(false)}
          className="w-full"
          size="lg"
        >
          Continue
        </Button>

        <p className="text-xs text-center text-muted-foreground px-4">
          By continuing, you agree to our terms and conditions.
        </p>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

  }

  /* =====================
     AI Loading Screen
  ===================== */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center">
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="absolute inset-0 animate-ping opacity-20">
            <Loader2 className="h-10 w-10 text-primary" />
          </div>
        </div>
        <p className="text-lg font-medium">
          {AI_TEXTS[aiIndex]}
        </p>
        <p className="text-sm text-muted-foreground max-w-md">
          Our AI system is analyzing your location and finding the best 
          delivery partner for timely newspaper delivery
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-8 max-w-4xl">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[220px] rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  /* =====================
     Card Renderer
  ===================== */
  const renderCard = (hoker: Hoker, isRecommended = false) => {
    const isSelected = selectedHoker === hoker._id

    return (
      <Card
        key={hoker._id}
        className={`relative transition-all duration-300 ${
          isRecommended
            ? "border-2 border-primary bg-gradient-to-br from-primary/5 to-transparent shadow-lg"
            : ""
        } ${isSelected ? "border-green-500 ring-2 ring-green-200" : ""}`}
      >
        {isRecommended && (
          <Badge className="absolute top-2 right-2 flex gap-1 bg-gradient-to-r from-primary to-pink-500">
            <Star size={12} /> Best Choice
          </Badge>
        )}

        <CardHeader className="flex flex-row gap-4 items-center">
          <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-primary/20">
            <AvatarImage src={hoker.photo || ""} />
            <AvatarFallback className="bg-primary/10">
              {hoker.full_name[0]}
            </AvatarFallback>
          </Avatar>

          <div>
            <CardTitle className="text-base">
              {hoker.full_name}
            </CardTitle>
            <CardDescription>
              Newspaper Distributor
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Phone size={14} />
            {hoker.mobile}
          </div>

          <div className="flex items-start gap-2">
            <MapPin size={14} className="mt-0.5" />
            <span className="text-muted-foreground">
              {hoker.address}, {hoker.village},{" "}
              {hoker.tehsil}, {hoker.district} –{" "}
              {hoker.pincode}
            </span>
          </div>

          <Button
            className={`w-full mt-3 relative ${
              isRecommended && !selectedHoker
                ? "animate-pulse shadow-lg"
                : ""
            }`}
            disabled={!!selectedHoker || submitting}
            variant={isSelected ? "secondary" : "default"}
            onClick={() => handleSelectHoker(hoker)}
          >
            {isSelected ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Selected
              </>
            ) : isRecommended ? (
              <div className="flex items-center justify-center w-full">
                <span>Select Hoker</span>
                {timeLeft > 0 && (
                  <div className="absolute right-2 flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded">
                    <Clock size={10} />
                    {timeLeft}s
                  </div>
                )}
              </div>
            ) : (
              "Select Hoker"
            )}
          </Button>

          {isRecommended && timeLeft > 0 && !selectedHoker && (
            <div className="text-xs text-center text-muted-foreground pt-1">
              Auto-select in {timeLeft} seconds
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-10">
      {/* ⭐ Recommended */}
      {recommended.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">
                ⭐ Best Choice (AI Recommended)
              </h2>
              <p className="text-sm text-muted-foreground">
                System ne aapke location ke hisaab se best hoker choose kiya hai
              </p>
            </div>
            {timeLeft > 0 && !selectedHoker && (
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Clock size={14} />
                <span className="font-medium">{timeLeft}s</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended.map((h) => renderCard(h, true))}
          </div>
        </div>
      )}

      {/* 🌍 Others */}
      {others.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            🌍 Other Available Hokers
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Aap inme se bhi koi hoker choose kar sakte hain
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {others.map((h) => renderCard(h))}
          </div>
        </div>
      )}

      {/* Timer Notification */}
      {timeLeft > 0 && recommended.length > 0 && !selectedHoker && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>
              Auto-selecting best hoker in <strong>{timeLeft} seconds</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}