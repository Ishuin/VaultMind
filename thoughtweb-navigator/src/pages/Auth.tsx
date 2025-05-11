"use client"

import type React from "react"

import { useState } from "react"
import { Link } from "react-router-dom" // Changed for react-router-dom
import { useAuth } from "@/context/AuthContext" // Added import
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Github, Fingerprint, Shield, Zap, Lock, Brain, ArrowLeft } from "lucide-react"

export default function AuthPage() {
  const [isScanning, setIsScanning] = useState(false)
  const { signInWithOAuth } = useAuth() // Added useAuth hook

  const handleScan = () => {
    setIsScanning(true)
    setTimeout(() => setIsScanning(false), 2000)
  }

  const handleGoogleSignIn = () => {
    signInWithOAuth("google")
  }

  const handleGithubSignIn = () => {
    signInWithOAuth("github")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background elements */}
      <div className="absolute inset-0 circuit-bg opacity-20"></div>

      {/* Animated orbs */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-[#00f6ff]/5 blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-[#ff00e5]/5 blur-[100px] animate-pulse"></div>

      <div className="w-full max-w-md relative z-10">
        <Link
          to="/"
          className="absolute -top-16 flex items-center text-gray-400 hover:text-[#00f6ff] transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="mb-8 text-center">
          <div className="inline-block relative mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00f6ff] via-[#ff00e5] to-[#3300ff] blur-xl opacity-30 animate-pulse"></div>
            <div className="relative flex items-center justify-center h-16 w-16 mx-auto">
              <Brain className="h-8 w-8 text-[#00f6ff] glow-text" />
            </div>
          </div>
          <h1 className="text-3xl font-bold glow-text text-transparent bg-clip-text bg-gradient-to-r from-[#00f6ff] to-[#ff00e5] mb-2">
            Welcome to ThoughtWeb
          </h1>
          <p className="text-gray-300">Sign in or create an account to get started</p>
        </div>

        <div className="glass-panel rounded-3xl overflow-hidden">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black/20 rounded-none p-0">
              <TabsTrigger
                value="signin"
                className="py-4 rounded-none data-[state=active]:bg-black/30 data-[state=active]:text-[#00f6ff]"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="py-4 rounded-none data-[state=active]:bg-black/30 data-[state=active]:text-[#ff00e5]"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin" className="p-6">
              <div className="space-y-6">
                {/* OAuth Buttons */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full glass-button text-gray-200"
                    type="button"
                    onClick={handleGoogleSignIn} // Added onClick handler
                  >
                    <div className="flex items-center justify-center w-5 h-5 mr-2 rounded-full bg-white/10">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3 h-3">
                        <path
                          fill="#EA4335"
                          d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
                        />
                        <path
                          fill="#34A853"
                          d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"
                        />
                        <path
                          fill="#4A90E2"
                          d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"
                        />
                      </svg>
                    </div>
                    Continue with Google
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full glass-button text-gray-200"
                    type="button"
                    onClick={handleGithubSignIn} // Added onClick handler
                  >
                    <Github className="w-5 h-5 mr-2" />
                    Continue with GitHub
                  </Button>
                </div>

                {/* Separator */}
                <div className="flex items-center">
                  <Separator className="flex-grow bg-gray-700" />
                  <span className="mx-2 text-xs text-gray-400">OR</span>
                  <Separator className="flex-grow bg-gray-700" />
                </div>

                {/* Email/Password Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-200">
                      Email
                    </Label>
                    <div className="relative">
                      <Input id="email" type="email" placeholder="your@email.com" className="glass-input pl-10" />
                      <Fingerprint className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-gray-200">
                        Password
                      </Label>
                      <Button variant="link" className="p-0 h-auto text-xs text-[#00f6ff] hover:text-[#00f6ff]/80">
                        Forgot Password?
                      </Button>
                    </div>
                    <div className="relative">
                      <Input id="password" type="password" className="glass-input pl-10" />
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <Button className="w-full glass-button border-[#00f6ff] text-[#00f6ff]">
                    <Zap className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup" className="p-6">
              <div className="space-y-6">
                {/* OAuth Buttons */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full glass-button text-gray-200"
                    type="button"
                    onClick={handleGoogleSignIn} // Added onClick handler
                  >
                    <div className="flex items-center justify-center w-5 h-5 mr-2 rounded-full bg-white/10">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3 h-3">
                        <path
                          fill="#EA4335"
                          d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
                        />
                        <path
                          fill="#34A853"
                          d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"
                        />
                        <path
                          fill="#4A90E2"
                          d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"
                        />
                      </svg>
                    </div>
                    Sign Up with Google
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full glass-button text-gray-200"
                    type="button"
                    onClick={handleGithubSignIn} // Added onClick handler
                  >
                    <Github className="w-5 h-5 mr-2" />
                    Sign Up with GitHub
                  </Button>
                </div>

                {/* Separator */}
                <div className="flex items-center">
                  <Separator className="flex-grow bg-gray-700" />
                  <span className="mx-2 text-xs text-gray-400">OR</span>
                  <Separator className="flex-grow bg-gray-700" />
                </div>

                {/* Registration Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-200">
                      Full Name
                    </Label>
                    <div className="relative">
                      <Input id="name" type="text" placeholder="John Doe" className="glass-input pl-10" />
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-gray-200">
                      Email
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        className="glass-input pl-10"
                      />
                      <Fingerprint className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-gray-200">
                      Password
                    </Label>
                    <div className="relative">
                      <Input id="signup-password" type="password" className="glass-input pl-10" />
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-400">
                      Password must be at least 8 characters long with a mix of letters, numbers, and symbols.
                    </p>
                  </div>
                  <Button className="w-full glass-button border-[#ff00e5] text-[#ff00e5]">
                    <Shield className="w-4 h-4 mr-2" />
                    Create Account
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to our{" "}
          <a href="#" className="text-[#00f6ff] hover:text-[#00f6ff]/80">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-[#00f6ff] hover:text-[#00f6ff]/80">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}

function User(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
