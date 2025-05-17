import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle2, Sparkles, Shield, Zap, Cpu, Globe, Lock } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function PricingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  const handlePlanSelect = (planName: string) => {
    // Store selected plan in localStorage or state management
    localStorage.setItem('selectedPlan', planName)
    // Redirect to auth page with plan type and billing cycle as query params
    navigate(`/auth?plan=${planName.toLowerCase()}&billingCycle=${billingCycle}`)
  }
  return (
    <div className="min-h-screen py-16 px-4 relative">
      {/* Background elements */}
      <div className="absolute inset-0 circuit-bg opacity-20"></div>

      {/* Animated orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#00f6ff]/5 blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#ff00e5]/5 blur-[100px] animate-pulse"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold glow-text text-transparent bg-clip-text bg-gradient-to-r from-[#00f6ff] via-[#ff00e5] to-[#3300ff] holo-shift mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-center text-gray-300 mb-8 max-w-3xl mx-auto">
            Select the perfect plan to enhance your knowledge management experience
          </p>
          <div className="flex justify-center gap-4 mb-8">
            <Button 
              className="glass-button px-6 py-2"
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly Billing
            </Button>
            <Button 
              className="glass-button px-6 py-2 border-[#ff00e5] text-[#ff00e5]"
              onClick={() => setBillingCycle('annual')}
            >
              Annual Billing
              <span className="ml-2 text-xs bg-[#ff00e5] text-black px-2 py-0.5 rounded-full">Save 20%</span>
            </Button>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <PricingCard
            name="Free"
            price="₹0"
            onClick={handlePlanSelect}
            description="Perfect for getting started with basic features"
            features={[
              "Up to 100 notes",
              "Basic AI organization",
              "1 GB storage",
              "Email support",
              "Mobile app access",
              "Basic search functionality",
            ]}
            specs={{
              "Storage Limit": "1 GB",
              "Monthly AI Credits": "100",
              "Response Time": "24 hours",
            }}
            buttonText="Get Started Free"
            color="teal"
            popular={false}
            icon={<Cpu />}
          />

          <PricingCard
            name="Pro"
            price={billingCycle === 'monthly' ? '₹1,299' : '₹12,372'}
            onClick={handlePlanSelect}
            period={billingCycle === 'monthly' ? '/month' : '/year'}
            description="Advanced features for serious knowledge management"
            features={[
              "Unlimited notes",
              "Advanced AI insights",
              "10 GB storage",
              "Priority support",
              "Custom categories",
              "API access",
              "Advanced search",
              "Offline access",
              "Collaboration (up to 3 users)",
            ]}
            specs={{
              "Storage Limit": "10 GB",
              "Monthly AI Credits": "1,000",
              "Response Time": "4 hours",
            }}
            buttonText="Try Pro Free for 14 Days"
            color="magenta"
            popular={true}
            icon={<Sparkles />}
          />

          <PricingCard
            name="Enterprise"
            price="Custom"
            onClick={handlePlanSelect}
            description="For teams and organizations with advanced needs"
            features={[
              "Unlimited notes",
              "Advanced AI insights",
              "Unlimited storage",
              "Dedicated support",
              "Custom integrations",
              "Team collaboration",
              "Advanced security",
              "Custom AI training",
              "On-premise deployment option",
              "SSO & advanced permissions",
            ]}
            specs={{
              "Storage Limit": "Unlimited",
              "Monthly AI Credits": "Unlimited",
              "Response Time": "1 hour",
            }}
            buttonText="Contact Sales"
            color="blue"
            popular={false}
            icon={<Globe />}
          />
        </div>

        {/* Feature Comparison */}
        <div className="glass-panel rounded-3xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-[#00f6ff] glow-text mb-8 text-center">Feature Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-4 text-gray-300">Feature</th>
                  <th className="text-center py-4 px-4 text-[#00f6ff]">Free</th>
                  <th className="text-center py-4 px-4 text-[#ff00e5]">Pro</th>
                  <th className="text-center py-4 px-4 text-[#3300ff]">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Notes", free: "100", pro: "Unlimited", enterprise: "Unlimited" },
                  { feature: "Storage", free: "1 GB", pro: "10 GB", enterprise: "Unlimited" },
                  { feature: "AI Organization", free: "Basic", pro: "Advanced", enterprise: "Advanced" },
                  { feature: "AI Insights", free: "Limited", pro: "Full Access", enterprise: "Custom Training" },
                  { feature: "Collaboration", free: "No", pro: "Up to 3 users", enterprise: "Unlimited" },
                  { feature: "API Access", free: "No", pro: "Yes", enterprise: "Yes" },
                  { feature: "Support", free: "Email", pro: "Priority", enterprise: "Dedicated" },
                  { feature: "Security", free: "Standard", pro: "Enhanced", enterprise: "Enterprise-grade" },
                  { feature: "Custom Integrations", free: "No", pro: "Limited", enterprise: "Full" },
                  { feature: "Offline Access", free: "No", pro: "Yes", enterprise: "Yes" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    <td className="py-4 px-4 text-gray-300">{row.feature}</td>
                    <td className="text-center py-4 px-4 text-gray-300">
                      {row.free === "Yes" ? (
                        <CheckCircle2 className="h-5 w-5 text-[#00f6ff] mx-auto" />
                      ) : row.free === "No" ? (
                        <span className="text-gray-500">—</span>
                      ) : (
                        row.free
                      )}
                    </td>
                    <td className="text-center py-4 px-4 text-gray-300">
                      {row.pro === "Yes" ? (
                        <CheckCircle2 className="h-5 w-5 text-[#ff00e5] mx-auto" />
                      ) : row.pro === "No" ? (
                        <span className="text-gray-500">—</span>
                      ) : (
                        row.pro
                      )}
                    </td>
                    <td className="text-center py-4 px-4 text-gray-300">
                      {row.enterprise === "Yes" ? (
                        <CheckCircle2 className="h-5 w-5 text-[#3300ff] mx-auto" />
                      ) : row.enterprise === "No" ? (
                        <span className="text-gray-500">—</span>
                      ) : (
                        row.enterprise
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="glass-panel rounded-3xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-[#00f6ff] glow-text mb-8 text-center">Frequently Asked Questions</h2>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-gray-800/50 data-[state=open]:bg-[#00f6ff]/5">
              <AccordionTrigger className="text-gray-200 hover:text-[#00f6ff] py-4 px-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-[#00f6ff] mr-3 animate-pulse"></div>
                  Can I upgrade or downgrade my plan at any time?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-300 px-9">
                Yes, you can upgrade or downgrade your plan at any time. When upgrading, the new features will be
                immediately available. When downgrading, the changes will take effect at the start of your next billing
                cycle.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-gray-800/50 data-[state=open]:bg-[#00f6ff]/5">
              <AccordionTrigger className="text-gray-200 hover:text-[#00f6ff] py-4 px-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-[#00f6ff] mr-3 animate-pulse"></div>
                  Is there a free trial available for paid plans?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-300 px-9">
                Yes, we offer a 14-day free trial for our Pro plan. You can experience all the Pro features without any
                commitment. No credit card is required to start your trial.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-gray-800/50 data-[state=open]:bg-[#00f6ff]/5">
              <AccordionTrigger className="text-gray-200 hover:text-[#00f6ff] py-4 px-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-[#00f6ff] mr-3 animate-pulse"></div>
                  What payment methods do you accept?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-300 px-9">
                We accept all major credit cards, including Visa, Mastercard, and American Express. For Enterprise
                customers, we also offer invoice-based payments and can accommodate specific payment requirements.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-gray-800/50 data-[state=open]:bg-[#00f6ff]/5">
              <AccordionTrigger className="text-gray-200 hover:text-[#00f6ff] py-4 px-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-[#00f6ff] mr-3 animate-pulse"></div>
                  How secure is my data?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-300 px-9">
                Your data security is our top priority. We use industry-standard encryption for all data, both in
                transit and at rest. Our systems are regularly audited for security compliance, and we never share your
                data with third parties without your explicit consent.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border-gray-800/50 data-[state=open]:bg-[#00f6ff]/5">
              <AccordionTrigger className="text-gray-200 hover:text-[#00f6ff] py-4 px-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-[#00f6ff] mr-3 animate-pulse"></div>
                  Can I cancel my subscription anytime?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-300 px-9">
                Yes, you can cancel your subscription at any time. After cancellation, you'll continue to have access to
                your paid features until the end of your current billing period. There are no cancellation fees or
                hidden charges.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl md:text-4xl font-bold glow-text text-transparent bg-clip-text bg-gradient-to-r from-[#00f6ff] to-[#ff00e5] mb-6">
            Ready to Transform Your Knowledge Management?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Start your journey with ThoughtWeb Navigator today and experience the future of AI-powered knowledge
            organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="glass-button px-8 py-6 text-lg">
                <span className="relative z-10 flex items-center">
                  <Zap className="mr-2 h-5 w-5" />
                  Get Started Free
                </span>
              </Button>
            </Link>
            <Button size="lg" className="glass-button px-8 py-6 text-lg border-[#ff00e5] text-[#ff00e5]">
              <span className="relative z-10 flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Contact Sales
              </span>
            </Button>
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
  specs: Record<string, string>
  buttonText: string
  color: "teal" | "magenta" | "blue"
  popular: boolean
  icon: React.ReactNode
  onClick: (planName: string) => void
}

function PricingCard({
  name,
  price,
  period = "",
  description,
  features,
  specs,
  buttonText,
  color,
  popular,
  icon,
  onClick,
}: PricingCardProps) {
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

      <div className="flex items-center mb-4">
        <div className={`w-10 h-10 rounded-full ${bgMap[color]}/10 flex items-center justify-center mr-3`}>
          {React.cloneElement(icon as React.ReactElement, { className: `h-6 w-6 ${colorMap[color]}` })}
        </div>
        <h3 className="text-2xl font-bold">{name}</h3>
      </div>

      <div className="flex items-baseline mb-4">
        <span className={`text-4xl font-bold ${colorMap[color]}`}>{price}</span>
        {period && <span className="text-gray-400 ml-1">{period}</span>}
      </div>

      <p className="text-gray-300 mb-6">{description}</p>

      <div className="mb-6 p-4 bg-black/30 rounded-xl">
        <div className="text-sm text-gray-400 mb-3">Plan Includes:</div>
        <div className="space-y-2">
          {Object.entries(specs).map(([key, value], index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-gray-300">{key}</span>
              <span className={`${colorMap[color]} font-medium`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-3">Features:</div>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle2 className={`h-5 w-5 ${colorMap[color]} mr-2 flex-shrink-0 mt-0.5`} />
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

          <Button
            className={`w-full glass-button border-${color === "teal" ? "[#00f6ff]" : color === "magenta" ? "[#ff00e5]" : "[#3300ff]"} text-${
              color === "teal" ? "[#00f6ff]" : color === "magenta" ? "[#ff00e5]" : "[#3300ff]"
            }`}
      onClick={() => onClick(name)}
      >
        <span className="relative z-10 flex items-center">
          {color === "teal" ? (
            <Lock className="mr-2 h-4 w-4" />
          ) : color === "magenta" ? (
            <Zap className="mr-2 h-4 w-4" />
          ) : (
            <Shield className="mr-2 h-4 w-4" />
          )}
          {buttonText}
        </span>
      </Button>
    </div>
  )
}
