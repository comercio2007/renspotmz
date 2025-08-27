
"use client"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    // Start fading out after a delay
    const fadeTimer = setTimeout(() => {
      setIsFading(true)
    }, 1500) // Adjust this duration as needed

    // Remove from DOM after fade out animation completes
    const removeTimer = setTimeout(() => {
      setIsVisible(false)
    }, 2000) // This should be fadeTimer duration + animation duration

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-background transition-opacity duration-500",
        isFading ? "opacity-0" : "opacity-100"
      )}
    >
      <div className="relative mb-4">
        <div className="absolute -inset-2 bg-primary/30 rounded-full animate-ping"></div>
        <div className="relative flex items-center justify-center w-24 h-24 bg-primary rounded-full shadow-lg">
          <span className="font-headline font-bold text-5xl text-primary-foreground">R</span>
        </div>
      </div>
      <h1 className="text-4xl font-headline font-bold tracking-wider animate-pulse">
        RentSpot
      </h1>
    </div>
  )
}
