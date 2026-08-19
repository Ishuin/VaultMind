import { useState, useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain, Sparkles, Cpu, Zap, Network, Globe, Lock, ArrowRight, ChevronRight,
  FileText, Search, MessageSquare, Shield, Clock, Users, Star, Check, Linkedin,
  BrainCircuit, Github
} from "lucide-react"
import { RazorpayCheckout } from "@/components/checkout/RazorpayCheckout"
import { apiFetch } from "@/lib/api"

/* ══════════════════════════════════════════════════════════════
   TICKER
══════════════════════════════════════════════════════════════ */
const TICKER_ITEMS = [
  "🧠 Personal AI Brain",
  "🔒 Private & Encrypted",
  "⚡ 40+ Connectors",
  "💡 Zero Re-explaining",
  "🚀 Built by a Founder for Founders",
  "✨ Founding Members Now Open",
  "🎯 Only 200 Founding Spots Total",
]

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="overflow-hidden border-b border-primary/20 bg-primary/5 py-2.5">
      <div className="ticker-track flex gap-10 whitespace-nowrap" style={{ width: "max-content" }}>
        {items.map((item, i) => (
          <span key={i} className="font-mono text-xs text-primary uppercase tracking-widest">
            {item}
            <span className="mx-5 text-primary/30">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   ORBITING DOTS
══════════════════════════════════════════════════════════════ */
function OrbitingDots() {
  const orbits = [
    { r: 130, dur: 7, initialDeg: 0, size: 8, opacity: 0.9 },
    { r: 105, dur: 11, initialDeg: 120, size: 5, opacity: 0.6 },
    { r: 158, dur: 15, initialDeg: 240, size: 6, opacity: 0.5 },
  ]
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
      {orbits.map((o, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ width: o.r * 2, height: o.r * 2, marginLeft: -o.r, marginTop: -o.r }}
          animate={{ rotate: 360 }}
          initial={{ rotate: o.initialDeg }}
          transition={{ duration: o.dur, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute rounded-full bg-primary"
            style={{
              width: o.size,
              height: o.size,
              top: 0,
              left: "50%",
              marginLeft: -o.size / 2,
              marginTop: -o.size / 2,
              opacity: o.opacity,
              boxShadow: `0 0 ${o.size * 3}px var(--primary)`,
            }}
          />
        </motion.div>
      ))}
      {[105, 130, 158].map((r, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-primary/10"
          style={{ width: r * 2, height: r * 2, marginLeft: -r, marginTop: -r }}
        />
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   CONNECTOR CHIPS
══════════════════════════════════════════════════════════════ */
const CONNECTORS = [
  "Gmail", "Google Drive", "Slack", "Notion",
  "ChatGPT Logs", "Claude Logs", "AI Chat Logs", "AI Conversations",
  "Google Sheets", "Google Calendar", "Bank & Cards", "Bookmarks",
  "Obsidian", "Twitter/X", "LinkedIn", "WhatsApp",
  "Voice Memos", "Screenshots", "Browser History", "RSS Feeds",
  "Jira", "GitHub",
]

function ConnectorChips() {
  const row1 = CONNECTORS.slice(0, 11)
  const row2 = CONNECTORS.slice(11)

  const Row = ({ items, className, speed = 35 }: { items: string[]; className?: string; speed?: number }) => {
    const repeated = useMemo(() => [...items, ...items], [items])
    return (
      <div
        className={`flex gap-3 ${className}`}
        style={{
          width: 'max-content',
          animationDuration: `${speed}s`,
        }}
      >
        {repeated.map((chip, ci) => (
          <div
            key={ci}
            className="px-4 py-2 border border-border bg-card/80 backdrop-blur-sm font-mono text-sm text-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-default whitespace-nowrap flex-shrink-0"
          >
            {chip}
          </div>
        ))}
      </div>
    )
  }

  return (
    <section className="py-28 overflow-hidden bg-background">
      <div className="max-w-5xl mx-auto text-center mb-14">
        <p className="font-mono text-xs text-primary uppercase tracking-[0.3em] mb-4">Connectors</p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
          40+ sources. One brain.
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          VaultMind ingests everywhere your knowledge lives. If you've thought it, written it, or saved it — we can index it.
        </p>
      </div>

      <div className="space-y-4">
        <Row items={[...row1, ...row1, ...row1]} className="animate-marquee-left" speed={30} />
        <Row items={[...row2, ...row2, ...row2]} className="animate-marquee-right" speed={36} />
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════
   PRICING SECTION (New Timeline Implementation)
══════════════════════════════════════════════════════════════ */
import { PricingTimeline } from "@/components/pricing/PricingTimeline"

function PricingSection() {
  const handleSelectPlan = (planId: string) => {
    // Scroll to checkout or open modal
    console.log("Selected plan:", planId)
  }

  return (
    <section id="pricing" className="py-28 px-4 bg-card/20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-mono text-xs text-primary uppercase tracking-[0.3em] mb-4"
          >
            Founding Tiers
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl text-foreground mb-4"
          >
            Prices rise as we build.{" "}
            <span className="text-primary italic">Lock yours in now.</span>
          </motion.h2>
          <p className="text-muted-foreground mb-4">
            150 early founder slots available. Price increases as slots fill up.
          </p>
          <p className="text-sm text-muted-foreground">
            Standard price after founding: <span className="font-mono text-primary">$250/mo</span>
          </p>
        </div>

        <PricingTimeline onSelectPlan={handleSelectPlan} />
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════
   FOUNDER SECTION
══════════════════════════════════════════════════════════════ */
function FounderSection() {
  const stats = [
    { val: "7+", label: "Years in Python/SaaS" },
    { val: "Tier-1", label: "Ex-Oracle, Deloitte, CloudBolt" },
    { val: "1", label: "Live Product" },
    { val: "0", label: "VC Funding" },
  ]

  return (
    <section className="py-28 px-4 border-t border-border bg-background">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="font-mono text-xs text-primary uppercase tracking-[0.3em] mb-4">The Builder</p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground">Meet the founder.</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative w-56 h-56">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary via-amber-400 to-amber-600 flex items-center justify-center text-6xl font-display font-bold text-black shadow-2xl">
                IK
              </div>
              <motion.div
                className="absolute -top-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Star className="w-5 h-5 text-black fill-black" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-5"
          >
            <div>
              <h3 className="font-display text-3xl text-foreground mb-1">Ishu Kumar</h3>
              <p className="font-mono text-sm text-primary uppercase tracking-widest">Technical Lead & Founder</p>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              7+ years building AI systems, cloud automation, and SaaS products. I've spent years watching brilliant founders lose their best ideas to fragmented tools and zero-memory AI.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              I'm also the founder of <span className="text-foreground font-medium">Zocept</span>, an AI-powered credit card optimization app. VaultMind is the tool I wish I'd had building it — a system that knows everything I know, and never forgets.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {stats.map((s, i) => (
                <div key={i} className="border border-border bg-card/60 p-3">
                  <div className="font-mono text-2xl font-bold text-primary">{s.val}</div>
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <a
              href="https://www.linkedin.com/in/ishukumars/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2.5 font-mono text-sm text-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              Connect on LinkedIn
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      navigate('/auth?email=' + encodeURIComponent(email.trim()))
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-ghost-canvas">
      {/* ── Navigation ── */}
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
              <a href="#pricing" className="text-sm text-slate-ink hover:text-midnight-navy transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" className="text-sm text-foreground hover:text-midnight-navy">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button className="btn-primary text-sm px-4 py-2">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Ticker ── */}
      <div className="pt-16">
        <Ticker />
      </div>

      {/* ── Hero ── */}
      <section className="relative flex-1 flex items-center justify-center py-28 px-4 overflow-hidden bg-gradient-to-br from-deep-cosmos via-midnight-navy to-deep-cosmos">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-ice-veil/10 blur-[100px]"></div>
        </div>

        <div className="absolute inset-0 flex items-start justify-center pointer-events-none" style={{ paddingTop: "12rem" }}>
          <div className="relative w-0 h-0">
            <OrbitingDots />
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
          >
            <Lock className="w-3 h-3 text-primary" />
            <span className="text-sm font-medium text-white/90">End-to-end encrypted · Air-gapped · Zero training</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl md:text-7xl text-white leading-tight tracking-tight"
          >
            Your AI has never{" "}
            <br className="hidden md:block" />
            <span className="text-primary italic">actually met you.</span>
            <br />
            Until now.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            VaultMind is your private AI brain — it ingests your entire digital life, indexes it securely, and lets you query it instantly. For founders who move fast and think deep.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16, scale: 0.97 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleWaitlistSubmit}
                  className="flex flex-col items-center gap-3 w-full max-w-md mx-auto"
                >
                  <div className="w-full flex flex-col sm:flex-row gap-2">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 bg-white/10 backdrop-blur-sm border-white/20 font-mono text-sm focus-visible:ring-primary rounded-none flex-1 text-white placeholder:text-white/40"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-base font-mono uppercase tracking-wider rounded-none bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  >
                    Start Free Trial — No Card Required <ArrowRight className="w-4 h-4" />
                  </Button>
                  <p className="text-xs text-white/40 font-mono">7-day trial. Full access. Cancel anytime.</p>
                </motion.form>
              ) : (
                <motion.div
                  key="confirmed"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="flex items-center gap-2 px-5 py-3 border border-primary/40 bg-primary/10 font-mono text-sm text-primary">
                    <Check className="w-4 h-4" />
                    🎉 Welcome to VaultMind! Your 7-day trial has started.
                  </div>
                  <a href="#pricing" className="font-mono text-sm text-primary hover:text-primary/80 transition-colors underline underline-offset-4">
                    View Founding Tiers ↓
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto pt-4"
          >
            {[
              { value: "10,000+", label: "On Waitlist" },
              { value: "100%", label: "Encrypted" },
              { value: "< 2s", label: "Query Response" },
              { value: "40+", label: "Connectors" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-mono text-2xl font-bold text-primary">{stat.value}</div>
                <div className="font-mono text-xs text-white/50 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Problem Section ── */}
      <section className="py-28 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4 leading-tight">
              You're the most expensive tool in your stack.
              <br />
              <span className="text-primary italic">You have no memory.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every founder hits the same wall. The tools are smart. You're smarter. But none of them know you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                emoji: "🔁",
                title: "You keep re-explaining yourself",
                desc: "Every new AI session starts from zero. You paste the same context, repeat your role, your company, your goals — again and again. Your time is the most expensive resource in the room.",
              },
              {
                emoji: "🕳️",
                title: "Your past decisions are invisible",
                desc: "A brilliant insight from six months ago sits buried in a Notion page, a Slack thread, or a forgotten chat export. You've already solved this problem. You just can't find the answer.",
              },
              {
                emoji: "💎",
                title: "Your context is worth millions",
                desc: "The accumulated knowledge of how you think, decide, and operate is genuinely valuable intellectual property. Right now, it's scattered across 12 apps and fading from memory.",
              },
            ].map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.12 }}
                whileHover={{ y: -4 }}
                className="p-8 border border-border bg-card/80 backdrop-blur-sm transition-all hover:border-primary/40"
              >
                <div className="text-3xl mb-4">{c.emoji}</div>
                <h3 className="font-sans font-bold text-lg text-foreground mb-3">{c.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-28 px-4 bg-card/30 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="font-mono text-xs text-primary uppercase tracking-[0.3em] mb-4">How It Works</p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground">
              Three steps. Then it's yours forever.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-0">
            {[
              {
                num: "01",
                title: "Connect everything",
                desc: "Plug in Gmail, Notion, Slack, your AI chat exports, browser history, documents, and 40+ more sources in minutes. OAuth-based. Read-only where possible.",
                icon: <Zap className="w-6 h-6 text-primary" />,
              },
              {
                num: "02",
                title: "VaultMind indexes your life",
                desc: "Your data is chunked, vectorized, and stored in your private vault. Nothing leaves your environment. No training. No sharing. Zero exposure.",
                icon: <BrainCircuit className="w-6 h-6 text-primary" />,
              },
              {
                num: "03",
                title: "Ask anything, instantly",
                desc: "Query your entire digital history in plain English. Get answers in under 2 seconds with citations. Your vault grows smarter the more you use it.",
                icon: <Shield className="w-6 h-6 text-primary" />,
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.15 }}
                className={`p-8 relative ${i < 2 ? "md:border-r border-border" : ""}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="font-mono text-4xl font-bold text-primary/20">{step.num}</span>
                  <div className="w-10 h-10 border border-primary/30 bg-primary/8 flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>
                <h3 className="font-sans font-bold text-xl text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                {i < 2 && (
                  <ChevronRight className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 text-primary/40 bg-background" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-28 px-4 bg-background">
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
            {[
              { icon: <Cpu className="w-6 h-6" />, title: "Local AI Processing", description: "Your data never leaves your machine. All embeddings and LLM inference happen locally with Ollama." },
              { icon: <Brain className="w-6 h-6" />, title: "Vector Search", description: "Semantic search finds relevant content even when you don't know the exact keywords." },
              { icon: <Shield className="w-6 h-6" />, title: "BYOK Architecture", description: "Bring your own API keys for any LLM provider. No subscriptions, no vendor lock-in." },
              { icon: <Globe className="w-6 h-6" />, title: "Multi-Format Support", description: "PDFs, Word docs, text files, and more. We handle the extraction, you focus on the ideas." },
              { icon: <Network className="w-6 h-6" />, title: "Knowledge Graph", description: "See how your ideas connect with an interactive graph visualization." },
              { icon: <Users className="w-6 h-6" />, title: "Team Collaboration", description: "Share knowledge bases with your team. Role-based access control included." },
            ].map((f, i) => (
              <div key={i} className="p-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  {f.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Connector Chips ── */}
      <ConnectorChips />

      {/* ── Demo CTA ── */}
      <section className="py-16 px-4 bg-primary/5 border-y border-primary/20">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl text-foreground"
          >
            See it think. Try the RAG demo.
          </motion.h2>
          <p className="text-muted-foreground">
            Paste any text into the vault, then ask questions about it. Watch your AI brain synthesize answers in real-time.
          </p>
          <Link to="/auth">
            <Button size="lg" className="rounded-none font-mono uppercase tracking-wider h-13 px-8 bg-primary text-primary-foreground hover:bg-primary/90">
              Try Interactive Demo →
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Pricing ── */}
      <PricingSection />

      {/* ── Founder ── */}
      <FounderSection />

      {/* ── Final CTA ── */}
      <section className="py-28 px-4 border-t border-border bg-card/20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-mono text-xs text-primary uppercase tracking-[0.3em] mb-4">Don't Wait</p>
            <h2 className="font-display text-4xl md:text-6xl text-foreground leading-tight">
              Your AI brain{" "}
              <span className="text-primary italic">is waiting.</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Only 200 founding slots available. Once they're gone, standard pricing ($250/mo) applies.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="final-form"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16, scale: 0.97 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleWaitlistSubmit}
                  className="flex flex-col items-center gap-3 w-full max-w-md mx-auto"
                >
                  <div className="w-full flex flex-col sm:flex-row gap-2">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 bg-card/80 backdrop-blur-sm border-border font-mono text-sm focus-visible:ring-primary rounded-none flex-1"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-base font-mono uppercase tracking-wider rounded-none bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  >
                    Start Free Trial — No Card Required <ArrowRight className="w-4 h-4" />
                  </Button>
                  <p className="text-xs text-muted-foreground font-mono">7-day trial. Full access. Cancel anytime.</p>
                </motion.form>
              ) : (
                <motion.div
                  key="final-confirmed"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="flex items-center gap-2 px-5 py-3 border border-primary/40 bg-primary/8 font-mono text-sm text-primary">
                    <Check className="w-4 h-4" />
                    Welcome to VaultMind! Your 7-day trial has started.
                  </div>
                  <a href="#pricing" className="rounded-none font-mono uppercase tracking-wider px-8 h-13 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center">
                    View Founding Tiers →
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
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
