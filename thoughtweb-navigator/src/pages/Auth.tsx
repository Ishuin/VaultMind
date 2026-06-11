"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Github, Shield, Lock, ArrowLeft, Mail, Phone } from "lucide-react"

export default function AuthPage() {
  const { signInWithOAuth, signUp, signIn } = useAuth()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleEmailSignIn = async () => {
    setLoading(true)
    try {
      const isEmail = identifier.includes("@")
      const credentials = isEmail
        ? { email: identifier, password }
        : { phone: identifier, password }

      const user = await signIn(credentials)
      if (!user) throw new Error("Sign in failed")

      if (user.identities?.length === 0) {
        navigate("/onboarding")
      } else if (!user.email_confirmed_at) {
        navigate("/verify-email")
      } else {
        navigate("/dashboard")
      }
    } catch (error) {
      console.error("Email sign in error:", error)
    }
    setLoading(false)
  }

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      console.error("Passwords do not match")
      return
    }
    try {
      await signUp(identifier, password)
    } catch (error) {
      console.error("Sign up error:", error)
    }
  }

  const handleGoogleSignIn = () => signInWithOAuth("google")
  const handleGithubSignIn = () => signInWithOAuth("github")
  const handleAzureSignIn = () => signInWithOAuth("azure")

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-ghost-canvas">
      <div className="w-full max-w-[400px] relative z-10">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center text-sm text-slate-ink hover:text-midnight-navy transition-colors mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-midnight-navy mb-5">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-chartreuse">
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
          <h1 className="font-display text-2xl font-bold text-midnight-navy mb-1">
            Welcome to VaultMind
          </h1>
          <p className="text-sm text-slate-ink">Sign in or create an account to get started</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-fog-border shadow-sm overflow-hidden">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-ghost-canvas rounded-none p-0 h-12 border-b border-fog-border">
              <TabsTrigger
                value="signin"
                className="rounded-none text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-midnight-navy data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-midnight-navy"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-none text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-midnight-navy data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-midnight-navy"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin" className="p-6 mt-0">
              <div className="space-y-5">
                {/* OAuth */}
                <div className="space-y-2.5">
                  <OAuthButton onClick={handleGoogleSignIn} provider="google" label="Continue with Google" />
                  <OAuthButton onClick={handleGithubSignIn} provider="github" label="Continue with GitHub" />
                  <OAuthButton onClick={handleAzureSignIn} provider="azure" label="Continue with Azure AD" />
                </div>

                {/* Divider */}
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-fog-border"></div>
                  <span className="px-3 text-xs text-slate-ink/60 font-medium bg-white">OR</span>
                  <div className="flex-grow border-t border-fog-border"></div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <FormField
                    id="signin-identifier"
                    label="Email or Phone"
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
              <div className="space-y-5">
                {/* OAuth */}
                <div className="space-y-2.5">
                  <OAuthButton onClick={handleGoogleSignIn} provider="google" label="Sign up with Google" />
                  <OAuthButton onClick={handleGithubSignIn} provider="github" label="Sign up with GitHub" />
                  <OAuthButton onClick={handleAzureSignIn} provider="azure" label="Sign up with Azure AD" />
                </div>

                {/* Divider */}
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-fog-border"></div>
                  <span className="px-3 text-xs text-slate-ink/60 font-medium bg-white">OR</span>
                  <div className="flex-grow border-t border-fog-border"></div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <FormField
                    id="signup-identifier"
                    label="Email or Phone"
                    placeholder="you@example.com"
                    value={identifier}
                    onChange={setIdentifier}
                    icon="mail"
                  />
                  <FormField
                    id="signup-password"
                    label="Password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={setPassword}
                    icon="lock"
                  />
                  <div>
                    <FormField
                      id="confirm-password"
                      label="Confirm Password"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      icon="lock"
                    />
                    <p className="text-xs text-slate-ink/50 mt-1.5">
                      Must be at least 8 characters with letters, numbers, and symbols.
                    </p>
                  </div>
                  <Button className="w-full btn-primary h-11" onClick={handleSignUp}>
                    <Shield className="w-4 h-4 mr-2" />
                    Create Account
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-ink/50 mt-5">
          By continuing, you agree to our{" "}
          <a href="#" className="text-midnight-navy hover:underline">Terms</a>
          {" "}and{" "}
          <a href="#" className="text-midnight-navy hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}

function OAuthButton({
  onClick,
  provider,
  label,
}: {
  onClick: () => void
  provider: "google" | "github" | "azure"
  label: string
}) {
  const icons = {
    google: (
      <svg viewBox="0 0 24 24" width="18" height="18">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
    github: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
    azure: (
      <svg viewBox="0 0 24 24" width="18" height="18">
        <path d="M11.4 2L2 14.1l6.3 3.2L11.4 2z" fill="#0078D4"/>
        <path d="M11.4 2L22 14.1h-6.3L11.4 2z" fill="#0078D4"/>
        <path d="M8.2 17.3L2 14.1l6.3 3.2h-.1z" fill="#0078D4"/>
        <path d="M17.7 17.3L22 14.1h-6.3v3.2h2z" fill="#0078D4"/>
        <path d="M11.4 22l6.3-4.7h-6.3v4.7z" fill="#50E6FF"/>
        <path d="M11.4 22L5.1 17.3h6.3v4.7z" fill="#50E6FF"/>
      </svg>
    ),
  }

  return (
    <Button
      variant="outline"
      className="w-full h-11 border-fog-border hover:bg-ghost-canvas text-slate-ink font-normal"
      type="button"
      onClick={onClick}
    >
      <span className="mr-3 flex items-center justify-center">{icons[provider]}</span>
      {label}
    </Button>
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
    <Lock className="h-4 w-4 text-slate-ink/40" />
  ) : (
    <Mail className="h-4 w-4 text-slate-ink/40" />
  )

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm text-slate-ink font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          className="input-antimetal h-11 pl-10 text-sm"
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
