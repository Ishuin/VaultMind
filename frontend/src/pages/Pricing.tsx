import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle2, Sparkles, Shield, Zap, Cpu, Globe, Lock, Brain, ArrowRight } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function PricingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  const handlePlanSelect = (planName: string) => {
    localStorage.setItem('selectedPlan', planName)
    navigate(`/auth?plan=${planName.toLowerCase()}&billingCycle=${billingCycle}`)
  }

  return (
    <div className="min-h-screen bg-ghost-canvas">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-fog-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-midnight-navy" />
              <span className="font-display font-bold text-midnight-navy text-lg">VaultMind</span>
            </Link>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-midnight-navy mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-slate-ink mb-8 max-w-3xl mx-auto">
            Choose the plan that works best for your knowledge management needs
          </p>
          
          {/* Billing Toggle */}
          <div className="flex justify-center gap-2 p-1 bg-white rounded-full border border-fog-border max-w-fit mx-auto">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-midnight-navy text-white'
                  : 'text-slate-ink hover:text-midnight-navy'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'annual'
                  ? 'bg-midnight-navy text-white'
                  : 'text-slate-ink hover:text-midnight-navy'
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-chartreuse text-midnight-navy px-2 py-0.5 rounded-full">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 max-w-5xl mx-auto">
          <PricingCard
            name="Starter"
            price="$0"
            onClick={handlePlanSelect}
            description="Perfect for personal use and getting started"
            features={[
              "500MB storage",
              "100 documents",
              "Basic AI features",
              "Email support",
              "Mobile app access",
            ]}
            buttonText="Get Started Free"
            popular={false}
          />

          <PricingCard
            name="Pro"
            price={billingCycle === 'monthly' ? '$29' : '$278'}
            onClick={handlePlanSelect}
            period={billingCycle === 'monthly' ? '/month' : '/year'}
            description="For serious knowledge workers"
            features={[
              "5GB storage",
              "Unlimited documents",
              "Advanced AI features",
              "Priority support",
              "API access",
              "Offline access",
            ]}
            buttonText="Start Pro Trial"
            popular={true}
          />

          <PricingCard
            name="Team"
            price={billingCycle === 'monthly' ? '$99' : '$950'}
            onClick={handlePlanSelect}
            period={billingCycle === 'monthly' ? '/month' : '/year'}
            description="For teams and organizations"
            features={[
              "50GB storage",
              "Unlimited everything",
              "Team collaboration",
              "Admin dashboard",
              "Custom integrations",
              "Dedicated support",
            ]}
            buttonText="Contact Sales"
            popular={false}
          />
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-2xl border border-fog-border shadow-sm p-8 mb-16">
          <h2 className="font-display text-2xl font-bold text-midnight-navy mb-8 text-center">Feature Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-fog-border">
                  <th className="text-left py-4 px-4 text-slate-ink font-medium">Feature</th>
                  <th className="text-center py-4 px-4 text-midnight-navy font-medium">Starter</th>
                  <th className="text-center py-4 px-4 text-midnight-navy font-medium">Pro</th>
                  <th className="text-center py-4 px-4 text-midnight-navy font-medium">Team</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Storage", starter: "500MB", pro: "5GB", team: "50GB" },
                  { feature: "Documents", starter: "100", pro: "Unlimited", team: "Unlimited" },
                  { feature: "AI Features", starter: "Basic", pro: "Advanced", team: "Advanced" },
                  { feature: "Collaboration", starter: "No", pro: "No", team: "Yes" },
                  { feature: "API Access", starter: "No", pro: "Yes", team: "Yes" },
                  { feature: "Offline Access", starter: "No", pro: "Yes", team: "Yes" },
                  { feature: "Support", starter: "Email", pro: "Priority", team: "Dedicated" },
                  { feature: "Admin Dashboard", starter: "No", pro: "No", team: "Yes" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-fog-border/50">
                    <td className="py-4 px-4 text-slate-ink">{row.feature}</td>
                    <td className="text-center py-4 px-4 text-slate-ink">
                      {row.starter === "Yes" ? (
                        <CheckCircle2 className="h-5 w-5 text-chartreuse mx-auto" />
                      ) : row.starter === "No" ? (
                        <span className="text-slate-ink/40">—</span>
                      ) : (
                        row.starter
                      )}
                    </td>
                    <td className="text-center py-4 px-4 text-slate-ink">
                      {row.pro === "Yes" ? (
                        <CheckCircle2 className="h-5 w-5 text-chartreuse mx-auto" />
                      ) : row.pro === "No" ? (
                        <span className="text-slate-ink/40">—</span>
                      ) : (
                        row.pro
                      )}
                    </td>
                    <td className="text-center py-4 px-4 text-slate-ink">
                      {row.team === "Yes" ? (
                        <CheckCircle2 className="h-5 w-5 text-chartreuse mx-auto" />
                      ) : row.team === "No" ? (
                        <span className="text-slate-ink/40">—</span>
                      ) : (
                        row.team
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl border border-fog-border shadow-sm p-8 mb-16">
          <h2 className="font-display text-2xl font-bold text-midnight-navy mb-8 text-center">Frequently Asked Questions</h2>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-fog-border">
              <AccordionTrigger className="text-slate-ink hover:text-midnight-navy py-4 px-4">
                Can I upgrade or downgrade my plan at any time?
              </AccordionTrigger>
              <AccordionContent className="text-slate-ink/80 px-4">
                Yes, you can upgrade or downgrade your plan at any time. When upgrading, the new features will be
                immediately available. When downgrading, the changes will take effect at the start of your next billing
                cycle.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-fog-border">
              <AccordionTrigger className="text-slate-ink hover:text-midnight-navy py-4 px-4">
                Is there a free trial available for paid plans?
              </AccordionTrigger>
              <AccordionContent className="text-slate-ink/80 px-4">
                Yes, we offer a 14-day free trial for our Pro plan. You can experience all the Pro features without any
                commitment. No credit card is required to start your trial.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-fog-border">
              <AccordionTrigger className="text-slate-ink hover:text-midnight-navy py-4 px-4">
                What payment methods do you accept?
              </AccordionTrigger>
              <AccordionContent className="text-slate-ink/80 px-4">
                We accept all major credit cards, including Visa, Mastercard, and American Express. For Team
                customers, we also offer invoice-based payments and can accommodate specific payment requirements.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-fog-border">
              <AccordionTrigger className="text-slate-ink hover:text-midnight-navy py-4 px-4">
                How secure is my data?
              </AccordionTrigger>
              <AccordionContent className="text-slate-ink/80 px-4">
                Your data security is our top priority. We use industry-standard encryption for all data, both in
                transit and at rest. Our systems are regularly audited for security compliance, and we never share your
                data with third parties without your explicit consent.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border-fog-border">
              <AccordionTrigger className="text-slate-ink hover:text-midnight-navy py-4 px-4">
                Can I cancel my subscription anytime?
              </AccordionTrigger>
              <AccordionContent className="text-slate-ink/80 px-4">
                Yes, you can cancel your subscription at any time. After cancellation, you'll continue to have access to
                your paid features until the end of your current billing period. There are no cancellation fees or
                hidden charges.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-br from-midnight-navy via-midnight-navy to-deep-cosmos rounded-2xl p-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Knowledge?
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            Start your journey with VaultMind today and experience the future of AI-powered knowledge management.
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
            <Link to="/">
              <Button size="lg" className="px-8 py-6 text-base bg-white/10 hover:bg-white/20 text-white border-0">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
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
  onClick: (planName: string) => void
}

function PricingCard({
  name,
  price,
  period = "",
  description,
  features,
  buttonText,
  popular,
  onClick,
}: PricingCardProps) {
  return (
    <div className={`relative p-8 bg-white rounded-2xl border ${popular ? 'border-midnight-navy shadow-lg' : 'border-fog-border shadow-sm'} transition-shadow`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full bg-chartreuse text-midnight-navy text-xs font-semibold">
          Most Popular
        </div>
      )}
      
      <h3 className="font-display text-xl font-bold text-midnight-navy mb-2">{name}</h3>
      
      <div className="flex items-baseline mb-4">
        <span className="text-4xl font-bold text-midnight-navy">{price}</span>
        {period && <span className="text-sm text-slate-ink ml-1">{period}</span>}
      </div>
      
      <p className="text-sm text-slate-ink mb-6">{description}</p>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle2 className="h-5 w-5 text-chartreuse mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-slate-ink">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button
        className={`w-full ${popular ? 'btn-primary' : 'bg-midnight-navy/5 hover:bg-midnight-navy/10 text-midnight-navy'}`}
        onClick={() => onClick(name)}
      >
        {buttonText}
      </Button>
    </div>
  )
}
