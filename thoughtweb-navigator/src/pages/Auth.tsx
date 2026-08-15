"use client"

import type React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Lock, ArrowLeft, Mail, AlertCircle } from "lucide-react"

export default function AuthPage() {
  const { signUp, signIn } = useAuth()
  const [searchParams] = useSearchParams()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  // Pre-fill email from URL params
  useEffect(() => {
    const emailFromUrl = searchParams.get('email')
    if (emailFromUrl) {
      setIdentifier(emailFromUrl)
    }
  }, [searchParams])

  const handleEmailSignIn = async () => {
    setError("")
    setLoading(true)
    try {
      const isEmail = identifier.includes("@")
      const credentials = isEmail
        ? { email: identifier, password }
        : { phone: identifier, password }

      const user = await signIn(credentials)
      if (!user) throw new Error("Invalid credentials. Please check your email and password.")

      if (user.identities?.length === 0) {
        navigate("/onboarding")
      } else if (!user.email_confirmed_at) {
        navigate("/verify-email")
      } else {
        navigate("/dashboard")
      }
    } catch (error: any) {
      setError(error.message || "Sign in failed. Please try again.")
    }
    setLoading(false)
  }

  const handleSignUp = async () => {
    setError("")
    if (!identifier.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    setLoading(true)
    try {
      await signUp(identifier, password)
    } catch (error: any) {
      setError(error.message || "Sign up failed. Please try again.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-[400px] relative z-10">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-primary mb-5">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
              <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
              <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
              <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
              <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
              <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
              <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
              <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
              <path d="M6 18a4 4 0 0 1-1.967-.516"/>
              <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">
            Welcome to VaultMind
          </h1>
          <p className="text-sm text-muted-foreground">Sign in or create an account to get started</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <Tabs defaultValue="signin" className="w-full" onValueChange={() => setError("")}>
            <TabsList className="grid w-full grid-cols-2 bg-muted rounded-none p-0 h-12 border-b border-border">
              <TabsTrigger
                value="signin"
                className="rounded-none text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-none text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin" className="p-6 mt-0">
              <div className="space-y-4">
                {/* Error banner */}
                {error && (
                  <div className="flex items-start gap-2.5 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Form */}
                <div className="space-y-4">
                  <FormField
                    id="signin-identifier"
                    label="Email"
                    placeholder="you@example.com"
                    value={identifier}
                    onChange={setIdentifier}
                    icon="mail"
                  />
                  <FormField
                    id="signin-password"
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={setPassword}
                    icon="lock"
                  />
                  <Button
                    className="w-full btn-primary h-11"
                    onClick={handleEmailSignIn}
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup" className="p-6 mt-0">
              <div className="space-y-4">
                {/* Error banner */}
                {error && (
                  <div className="flex items-start gap-2.5 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Form */}
                <div className="space-y-4">
                  <FormField
                    id="signup-identifier"
                    label="Email"
                    placeholder="you@example.com"
                    value={identifier}
                    onChange={setIdentifier}
                    icon="mail"
                  />
                  <FormField
                    id="signup-password"
                    label="Password"
                    type="password"
                    placeholder="Create a password (min. 8 characters)"
                    value={password}
                    onChange={setPassword}
                    icon="lock"
                  />
                  <FormField
                    id="confirm-password"
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    icon="lock"
                  />
                  <Button className="w-full btn-primary h-11" onClick={handleSignUp} disabled={loading}>
                    <Shield className="w-4 h-4 mr-2" />
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/50 mt-5">
          By continuing, you agree to our{" "}
          <a href="#" className="text-foreground hover:underline">Terms</a>
          {" "}and{" "}
          <a href="#" className="text-foreground hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}



function FormField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
}: {
  id: string
  label: string
  type?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  icon: "mail" | "lock"
}) {
  const iconEl = icon === "lock" ? (
    <Lock className="h-4 w-4 text-muted-foreground/40" />
  ) : (
    <Mail className="h-4 w-4 text-muted-foreground/40" />
  )

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm text-foreground font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          className="input-themed h-11 pl-10 text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          {iconEl}
        </span>
      </div>
    </div>
  )
}
