import React from "react"
import { Link } from "react-router-dom" // Changed for react-router-dom
import { Button } from "@/components/ui/button"
import { Brain, Sparkles, Cpu, Zap, Network, Globe, Lock, ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-20 md:py-32 text-center relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 circuit-bg opacity-30"></div>

        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#00f6ff]/5 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#ff00e5]/5 blur-[100px] animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#3300ff]/5 blur-[80px] animate-pulse"></div>

        <div className="relative z-10">
          <div className="mb-6 inline-block relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00f6ff] via-[#ff00e5] to-[#3300ff] blur-xl opacity-30 animate-pulse"></div>
            <div className="relative flex items-center justify-center h-20 w-20 mx-auto">
              <div className="absolute inset-0 rounded-full border border-[#00f6ff]/30 rotating"></div>
              <div
                className="absolute inset-1 rounded-full border border-[#ff00e5]/20 rotating"
                style={{ animationDirection: "reverse", animationDuration: "15s" }}
              ></div>
              <div
                className="absolute inset-2 rounded-full border border-[#3300ff]/10 rotating"
                style={{ animationDuration: "25s" }}
              ></div>
              <Brain className="h-10 w-10 text-[#00f6ff] glow-text" />
            </div>
          </div>

          <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-4 glow-text text-transparent bg-clip-text bg-gradient-to-r from-[#00f6ff] via-[#ff00e5] to-[#3300ff] holo-shift">
            ThoughtWeb Navigator
          </h1>
          <h2 className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-300">
            Advanced AI-powered knowledge management for seamless thought organization and creation
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/auth">
              <Button size="lg" className="glass-button px-8 py-6 text-lg">
                <span className="relative z-10 flex items-center">
                  <Zap className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                  Get Started Free
                </span>
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" className="glass-button px-8 py-6 text-lg border-[#ff00e5] text-[#ff00e5]">
                <span className="relative z-10 flex items-center">
                  <Network className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                  View Pricing
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 relative">
        <div className="absolute inset-0 hexagon-bg opacity-30"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold glow-text text-transparent bg-clip-text bg-gradient-to-r from-[#00f6ff] to-[#ff00e5] mb-4">
              Key Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover how ThoughtWeb Navigator transforms your knowledge management experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Cpu className="w-10 h-10 text-[#00f6ff]" />}
              title="AI-Powered Organization"
              description="Automatically categorize and connect your notes, documents, and ideas using advanced machine learning algorithms."
              color="teal"
            />
            <FeatureCard
              icon={<Sparkles className="w-10 h-10 text-[#ff00e5]" />}
              title="Smart Insights"
              description="Discover connections between ideas and generate new insights with AI analysis of your knowledge base."
              color="magenta"
            />
            <FeatureCard
              icon={<Globe className="w-10 h-10 text-[#3300ff]" />}
              title="Seamless Integration"
              description="Connect with your favorite tools and services for a unified knowledge management experience."
              color="blue"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold glow-text text-transparent bg-clip-text bg-gradient-to-r from-[#00f6ff] to-[#ff00e5] mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Getting started with ThoughtWeb Navigator is simple and intuitive
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Sign Up"
              description="Create your account in seconds and set up your personal knowledge space."
              icon={<Lock className="w-8 h-8" />}
              color="teal"
            />
            <StepCard
              number="02"
              title="Import Your Content"
              description="Easily import notes, documents, and ideas from various sources."
              icon={<Network className="w-8 h-8" />}
              color="magenta"
            />
            <StepCard
              number="03"
              title="Explore & Create"
              description="Discover connections, generate insights, and create new content with AI assistance."
              icon={<Sparkles className="w-8 h-8" />}
              color="blue"
            />
          </div>

          <div className="text-center mt-12">
            <Link to="/auth">
              <Button className="glass-button px-8 py-6 text-lg">
                <span className="relative z-10 flex items-center">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-16 px-4 relative">
        <div className="absolute inset-0 circuit-bg opacity-20"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold glow-text text-transparent bg-clip-text bg-gradient-to-r from-[#00f6ff] to-[#ff00e5] mb-4">
              Flexible Pricing
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Choose the plan that works best for your needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <PricingCard
              name="Free"
              price="₹0"
              description="Perfect for getting started with basic features"
              features={["Up to 100 notes", "Basic AI organization", "1 GB storage", "Email support"]}
              buttonText="Get Started"
              color="teal"
              popular={false}
            />
            <PricingCard
              name="Pro"
              price="₹1,299"
              period="/month"
              description="Advanced features for serious knowledge management"
              features={[
                "Unlimited notes",
                "Advanced AI insights",
                "10 GB storage",
                "Priority support",
                "Custom categories",
                "API access",
              ]}
              buttonText="Try Pro Free"
              color="magenta"
              popular={true}
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              description="For teams and organizations with advanced needs"
              features={[
                "Unlimited notes",
                "Advanced AI insights",
                "Unlimited storage",
                "Dedicated support",
                "Custom integrations",
                "Team collaboration",
                "Advanced security",
              ]}
              buttonText="Contact Sales"
              color="blue"
              popular={false}
            />
          </div>

          <div className="text-center">
            <Link to="/pricing">
              <Button className="glass-button px-8 py-6 text-lg">
                <span className="relative z-10 flex items-center">
                  View Full Pricing Details
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800/50 mt-auto relative">
        <div className="absolute inset-0 circuit-bg opacity-10"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center relative z-10">
          <div className="flex items-center mb-4 md:mb-0">
            <Brain className="h-5 w-5 text-[#00f6ff] mr-2" />
            <p className="text-gray-400">
              <span className="text-[#00f6ff]">ThoughtWeb</span> © {new Date().getFullYear()} | All Rights Reserved
            </p>
          </div>
          <div className="flex gap-6">
            {["Terms", "Privacy", "Security", "Contact"].map((item, i) => (
              <Link key={i} to="#" className="text-gray-400 hover:text-[#00f6ff] transition-colors text-sm">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  color: "teal" | "magenta" | "blue"
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  const colorMap = {
    teal: "text-[#00f6ff]",
    magenta: "text-[#ff00e5]",
    blue: "text-[#3300ff]",
  }

  const glowMap = {
    teal: "teal-glow",
    magenta: "magenta-glow",
    blue: "blue-glow",
  }

  return (
    <div className="glass-panel p-8 rounded-3xl">
      <div className="mb-6 floating">
        <div className="relative inline-flex">
          <div className={`absolute inset-0 rounded-full ${colorMap[color]}/20 blur-lg`}></div>
          {icon}
        </div>
      </div>
      <h3 className={`text-xl font-bold mb-4 ${colorMap[color]} glow-text`}>{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  )
}

interface StepCardProps {
  number: string
  title: string
  description: string
  icon: React.ReactNode
  color: "teal" | "magenta" | "blue"
}

function StepCard({ number, title, description, icon, color }: StepCardProps) {
  const colorMap = {
    teal: "text-[#00f6ff]",
    magenta: "text-[#ff00e5]",
    blue: "text-[#3300ff]",
  }

  const bgMap = {
    teal: "bg-[#00f6ff]",
    magenta: "bg-[#ff00e5]",
    blue: "bg-[#3300ff]",
  }

  return (
    <div className="glass-panel p-8 rounded-3xl relative">
      <div className={`absolute top-4 right-4 text-4xl font-bold opacity-10 ${colorMap[color]}`}>{number}</div>
      <div className="mb-6">
        <div className={`w-12 h-12 rounded-full ${bgMap[color]}/10 flex items-center justify-center`}>
          {React.cloneElement(icon as React.ReactElement, { className: `h-6 w-6 ${colorMap[color]}` })}
        </div>
      </div>
      <h3 className={`text-xl font-bold mb-4 ${colorMap[color]}`}>{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  )
}

interface PricingCardProps {
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  buttonText: string
  color: "teal" | "magenta" | "blue"
  popular: boolean
}

function PricingCard({
  name,
  price,
  period = "",
  description,
  features,
  buttonText,
  color,
  popular,
}: PricingCardProps) {
  const colorMap = {
    teal: "text-[#00f6ff]",
    magenta: "text-[#ff00e5]",
    blue: "text-[#3300ff]",
  }

  const borderMap = {
    teal: "border-[#00f6ff]",
    magenta: "border-[#ff00e5]",
    blue: "border-[#3300ff]",
  }

  return (
    <div
      className={`glass-panel p-8 rounded-3xl relative ${
        popular ? `border-2 ${borderMap[color]} shadow-lg shadow-${color}/20` : ""
      }`}
    >
      {popular && (
        <div
          className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-medium ${colorMap[color]} bg-black border ${borderMap[color]}`}
        >
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold mb-2">{name}</h3>
      <div className="flex items-baseline mb-4">
        <span className={`text-4xl font-bold ${colorMap[color]}`}>{price}</span>
        {period && <span className="text-gray-400 ml-1">{period}</span>}
      </div>
      <p className="text-gray-300 mb-6">{description}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg
              className={`h-5 w-5 ${colorMap[color]} mr-2 flex-shrink-0 mt-0.5`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        className={`w-full glass-button border-${color === "teal" ? "[#00f6ff]" : color === "magenta" ? "[#ff00e5]" : "[#3300ff]"} text-${
          color === "teal" ? "[#00f6ff]" : color === "magenta" ? "[#ff00e5]" : "[#3300ff]"
        }`}
      >
        {buttonText}
      </Button>
    </div>
  )
}
