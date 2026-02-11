"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, RefreshCw, AlertTriangle, Frown, Search, ArrowLeft, Phone, Mail, MessageCircle } from "lucide-react"

interface ErrorPageProps {
  error?: Error & { digest?: string }
  reset?: () => void
  errorCode?: string | number
  errorMessage?: string
  errorTitle?: string
}

// Predefined error messages and configurations
const ERROR_CONFIGS: Record<string, { icon: React.ReactNode; title: string; message: string; suggestions: string[] }> = {
  "400": {
    icon: <AlertTriangle className="w-24 h-24 text-enkaji-ochre animate-pulse-glow" />,
    title: "Oops! Something Went Wrong",
    message: "The request you made was invalid. Please check your input and try again.",
    suggestions: [
      "Verify all required fields are filled correctly",
      "Check your internet connection",
      "Try refreshing the page",
    ],
  },
  "401": {
    icon: <Frown className="w-24 h-24 text-enkaji-red animate-pulse-glow" />,
    title: "Access Denied",
    message: "You need to be logged in to access this resource. Please sign in to continue.",
    suggestions: [
      "Sign in to your account",
      "Check if your session has expired",
      "Contact support if the problem persists",
    ],
  },
  "403": {
    icon: <Frown className="w-24 h-24 text-enkaji-red animate-pulse-glow" />,
    title: "Permission Denied",
    message: "You don't have permission to view this page. This area is restricted.",
    suggestions: [
      "Check if you have the correct account type",
      "Contact your administrator",
      "Return to the main site",
    ],
  },
  "404": {
    icon: <Search className="w-24 h-24 text-enkaji-ochre animate-pulse-glow" />,
    title: "Page Not Found",
    message: "The page you're looking for doesn't exist, has been moved, or is temporarily unavailable.",
    suggestions: [
      "Check the URL for typos",
      "Use the navigation menu to find what you need",
      "Visit our homepage for trending items",
    ],
  },
  "500": {
    icon: <AlertTriangle className="w-24 h-24 text-enkaji-red animate-pulse-glow" />,
    title: "Server Error",
    message: "Something went wrong on our end. Our team has been notified and is working to fix it.",
    suggestions: [
      "Try refreshing the page in a few moments",
      "Clear your browser cache and try again",
      "Contact support if the issue continues",
    ],
  },
  "503": {
    icon: <AlertTriangle className="w-24 h-24 text-enkaji-ochre animate-pulse-glow" />,
    title: "Service Temporarily Unavailable",
    message: "We're performing scheduled maintenance. Please check back soon!",
    suggestions: [
      "We apologize for the inconvenience",
      "Follow us on social media for updates",
      "Try again in a few minutes",
    ],
  },
}

function ErrorPageContent({ error, reset, errorCode = "500", errorMessage, errorTitle }: ErrorPageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [currentTime, setCurrentTime] = useState<string>("")

  useEffect(() => {
    // Staggered animation
    const timer = setTimeout(() => setIsVisible(true), 100)
    
    // Update time
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString())
    }
    updateTime()
    const timeInterval = setInterval(updateTime, 1000)

    return () => {
      clearTimeout(timer)
      clearInterval(timeInterval)
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Get error configuration or use default
  const config = ERROR_CONFIGS[errorCode.toString()] || ERROR_CONFIGS["500"]
  const displayTitle = errorTitle || config.title
  const displayMessage = errorMessage || config.message

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-background via-background to-enkaji-cream/20 dark:from-background dark:via-background dark:to-enkaji-brown/20">
      {/* Animated Background Elements */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 38, 53, 0.05) 0%, transparent 50%)`,
        }}
      />
      
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-enkaji-red/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-enkaji-ochre/5 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-enkaji-gold/5 rounded-full blur-2xl animate-float" />

      {/* Breadcrumb decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-enkaji-red via-enkaji-ochre to-enkaji-brown" />

      {/* Main Error Card */}
      <Card 
        className={`w-full max-w-2xl relative z-10 border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Decorative gradient border */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-enkaji-red via-enkaji-ochre to-enkaji-brown p-[1px]">
          <div className="absolute inset-0 rounded-lg bg-white/80 dark:bg-gray-900/80" />
        </div>

        <CardContent className="relative p-8 md:p-12 flex flex-col items-center text-center space-y-8">
          {/* Error Icon with Animation */}
          <div className="relative group">
            <div className="absolute inset-0 bg-enkaji-red/20 rounded-full blur-xl group-hover:bg-enkaji-red/30 transition-all duration-500" />
            <div className="relative" style={{ animation: "bounce-subtle 2s ease-in-out infinite" }}>
              {config.icon}
            </div>
          </div>

          {/* Error Code */}
          <div className="space-y-2">
            <h1 className="text-8xl font-bold text-enkaji-gradient font-playfair tracking-tight animate-fade-in">
              {errorCode}
            </h1>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-enkaji-red to-enkaji-ochre rounded-full" />
          </div>

          {/* Error Title */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              {displayTitle}
            </h2>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              {displayMessage}
            </p>
          </div>

          {/* Error Details (Development Mode) */}
          {process.env.NODE_ENV === "development" && error && (
            <div className="w-full p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800/50 text-left">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                Error Details (Development Only):
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 font-mono break-all">
                {error.message}
              </p>
              {error.stack && (
                <pre className="text-xs text-red-600 dark:text-red-400 mt-2 overflow-x-auto">
                  {error.stack.split("\n").slice(0, 5).join("\n")}
                </pre>
              )}
              {error.digest && (
                <p className="text-xs text-red-500 mt-2">
                  Error Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Suggestions Section */}
          <div className="w-full space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
              <span className="h-px w-8 bg-enkaji-ochre/50" />
              What You Can Do
              <span className="h-px w-8 bg-enkaji-ochre/50" />
            </div>
            
            <div className="grid gap-3 md:grid-cols-3">
              {config.suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200 text-left"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-enkaji-red/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-enkaji-red">{index + 1}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md pt-4">
            {reset && (
              <Button 
                onClick={reset}
                className="flex-1 enkaji-button-primary btn-hover-lift group"
                size="lg"
              >
                <RefreshCw className="mr-2 h-5 w-5 group-hover:animate-spin" />
                Try Again
              </Button>
            )}
            <Button 
              onClick={() => window.location.href = "/"}
              className="flex-1 enkaji-button-secondary btn-hover-lift"
              size="lg"
              variant="outline"
            >
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </div>

          {/* Secondary Navigation */}
          <div className="flex items-center gap-4 pt-4 border-t border-border w-full justify-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.history.back()}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <span className="text-muted-foreground/30">|</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = "/contact"}
              className="text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </div>

          {/* Timestamp */}
          <div className="text-xs text-muted-foreground/50">
            Error occurred at {currentTime}
          </div>
        </CardContent>
      </Card>

      {/* Enkaji Branding Footer */}
      <div className="mt-8 text-center space-y-2 relative z-10">
        <p className="text-lg font-bold font-playfair text-enkaji-gradient">
          Enkaji Trade Kenya
        </p>
        <p className="text-sm text-muted-foreground">
          Kenya's Leading Marketplace • Connecting Businesses
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <a href="tel:+254700000000" className="text-xs text-muted-foreground hover:text-enkaji-red transition-colors flex items-center gap-1">
            <Phone className="w-3 h-3" />
            +254 700 000 000
          </a>
          <a href="mailto:support@enkaji.co.ke" className="text-xs text-muted-foreground hover:text-enkaji-red transition-colors flex items-center gap-1">
            <Mail className="w-3 h-3" />
            support@enkaji.co.ke
          </a>
        </div>
      </div>

      {/* Decorative bottom gradient */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-enkaji-brown via-enkaji-ochre to-enkaji-red" />

      <style jsx global>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default function Error({ error, reset }: { error?: Error & { digest?: string }; reset?: () => void }) {
  return <ErrorPageContent error={error} reset={reset} />
}

export { ErrorPageContent }
export type { ErrorPageProps }

