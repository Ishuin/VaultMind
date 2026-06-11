import React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Brain, Sparkles, Cpu, Zap, Network, Globe, Lock, ArrowRight, ChevronRight, FileText, Search, MessageSquare, Shield, Clock, Users } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ghost-canvas">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-fog-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-midnight-navy" />
              <span className="font-display font-bold text-midnight-navy text-lg">VaultMind</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-ink hover:text-midnight-navy transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-slate-ink hover:text-midnight-navy transition-colors">How It Works</a>
              <Link to="/pricing" className="text-sm text-slate-ink hover:text-midnight-navy transition-colors">Pricing</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" className="text-sm text-slate-ink hover:text-midnight-navy">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button className="btn-primary text-sm px-4 py-2">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-br from-deep-cosmos via-midnight-navy to-deep-cosmos">
        {/* Subtle background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-ice-veil/10 blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6 inline-block">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-white/90">AI-Powered Knowledge Management</span>
            </div>
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Your Second Brain for
            <span className="block text-primary">Smarter Decisions</span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed">
            ThoughtWeb Navigator transforms scattered notes, documents, and ideas into an intelligent knowledge graph. 
            Ask questions, discover connections, and generate insights with local AI processing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="btn-primary px-8 py-6 text-base">
                <span className="flex items-center">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" className="px-8 py-6 text-base bg-white/10 hover:bg-white/20 text-white border-0">
                <span className="flex items-center">
                  View Pricing
                  <ChevronRight className="ml-2 h-5 w-5" />
                </span>
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-white/50">No credit card required • 500MB free storage • Cancel anytime</p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Stop Losing Your Best Ideas
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Knowledge workers waste 30% of their time searching for information scattered across tools and notes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ProblemCard
              icon={<FileText className="w-6 h-6" />}
              title="Scattered Notes"
              description="Your ideas are spread across Notion, Google Docs, PDFs, and random text files. Finding anything takes forever."
            />
            <ProblemCard
              icon={<Search className="w-6 h-6" />}
              title="No Context"
              description="Search gives you documents, not answers. You still have to read everything to find what you need."
            />
            <ProblemCard
              icon={<Clock className="w-6 h-6" />}
              title="Wasted Time"
              description="You know you have the answer somewhere. But finding it takes longer than just figuring it out again."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Three Steps to Your Second Brain
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our simple, intuitive workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Upload Your Content"
              description="Import PDFs, text files, or paste content directly. Our AI processes and indexes everything locally."
              icon={<FileText className="w-6 h-6" />}
            />
            <StepCard
              number="02"
              title="Ask Questions"
              description="Chat naturally with your knowledge base. Our RAG system finds relevant context and generates accurate answers."
              icon={<MessageSquare className="w-6 h-6" />}
            />
            <StepCard
              number="03"
              title="Discover Insights"
              description="Uncover hidden connections between ideas. Let AI surface patterns you never knew existed."
              icon={<Sparkles className="w-6 h-6" />}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Serious Knowledge Workers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade features with a consumer-friendly interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Cpu className="w-6 h-6" />}
              title="Local AI Processing"
              description="Your data never leaves your machine. All embeddings and LLM inference happen locally with Ollama."
            />
            <FeatureCard
              icon={<Brain className="w-6 h-6" />}
              title="Vector Search"
              description="Semantic search finds relevant content even when you don't know the exact keywords."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="BYOK Architecture"
              description="Bring your own API keys for any LLM provider. No subscriptions, no vendor lock-in."
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Multi-Format Support"
              description="PDFs, Word docs, text files, and more. We handle the extraction, you focus on the ideas."
            />
            <FeatureCard
              icon={<Network className="w-6 h-6" />}
              title="Knowledge Graph"
              description="See how your ideas connect with an interactive graph visualization."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Team Collaboration"
              description="Share knowledge bases with your team. Role-based access control included."
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you need more. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Starter"
              price="$0"
              description="Perfect for personal use and getting started"
              features={["500MB storage", "100 documents", "Basic AI features", "Community support"]}
              buttonText="Get Started Free"
              popular={false}
            />
            <PricingCard
              name="Pro"
              price="$29"
              period="/month"
              description="For serious knowledge workers"
              features={["5GB storage", "Unlimited documents", "Advanced AI features", "Priority support", "API access"]}
              buttonText="Start Pro Trial"
              popular={true}
            />
            <PricingCard
              name="Team"
              price="$99"
              period="/month"
              description="For teams and organizations"
              features={["50GB storage", "Unlimited everything", "Team collaboration", "Admin dashboard", "Custom integrations"]}
              buttonText="Contact Sales"
              popular={false}
            />
          </div>

          <div className="text-center mt-12">
            <Link to="/pricing">
              <Button variant="link" className="text-foreground hover:text-foreground/80">
                Compare all features <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-deep-cosmos via-midnight-navy to-deep-cosmos">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Knowledge?
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
            Join thousands of knowledge workers who are building their second brain with VaultMind.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="btn-primary px-8 py-6 text-base">
                <span className="flex items-center">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" className="px-8 py-6 text-base bg-white/10 hover:bg-white/20 text-white border-0">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Brain className="h-5 w-5 text-foreground mr-2" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">VaultMind</span> © {new Date().getFullYear()} | All Rights Reserved
            </p>
          </div>
          <div className="flex gap-6">
            {["Terms", "Privacy", "Security", "Contact"].map((item, i) => (
              <Link key={i} to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

interface ProblemCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function ProblemCard({ icon, title, description }: ProblemCardProps) {
  return (
    <div className="text-center p-6">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4 text-destructive">
        {icon}
      </div>
      <h3 className="font-display text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

interface StepCardProps {
  number: string
  title: string
  description: string
  icon: React.ReactNode
}

function StepCard({ number, title, description, icon }: StepCardProps) {
  return (
    <div className="relative p-8 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="absolute top-4 right-4 text-4xl font-display font-bold text-foreground/5">{number}</div>
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
        {icon}
      </div>
      <h3 className="font-display text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
        {icon}
      </div>
      <h3 className="font-display text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
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
  popular: boolean
}

function PricingCard({
  name,
  price,
  period = "",
  description,
  features,
  buttonText,
  popular,
}: PricingCardProps) {
  return (
    <div className={`relative p-8 bg-card rounded-2xl border ${popular ? 'border-primary shadow-lg' : 'border-border shadow-sm'} transition-shadow`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
          Most Popular
        </div>
      )}
      <h3 className="font-display text-xl font-bold text-foreground mb-2">{name}</h3>
      <div className="flex items-baseline mb-4">
        <span className="text-3xl font-bold text-foreground">{price}</span>
        {period && <span className="text-sm text-muted-foreground ml-1">{period}</span>}
      </div>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <Button className={`w-full ${popular ? 'btn-primary' : 'bg-muted hover:bg-muted/80 text-foreground'}`}>
        {buttonText}
      </Button>
    </div>
  )
}
