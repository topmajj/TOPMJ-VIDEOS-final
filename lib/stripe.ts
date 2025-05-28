import Stripe from "stripe"

// Check if STRIPE_SECRET_KEY is available, use a fallback for development
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_fallback"

// Only initialize Stripe if we're in a server context
let stripe: Stripe | null = null

// Use a try-catch to handle initialization errors
try {
  if (typeof window === "undefined") {
    // Only initialize on the server
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    })
  }
} catch (error) {
  console.error("Failed to initialize Stripe:", error)
}

export { stripe }

export const PLANS = [
  {
    id: "basic",
    name: "Basic",
    description: "500 credits per month",
    price: 9.99,
    credits: 500,
    features: ["Basic AI video generation", "Standard quality", "Email support"],
    stripePriceId: process.env.STRIPE_PRICE_BASIC || "price_basic",
  },
  {
    id: "pro",
    name: "Pro",
    description: "1,500 credits per month",
    price: 24.99,
    credits: 1500,
    features: ["Advanced AI video generation", "HD quality", "Priority support", "Custom avatars"],
    stripePriceId: process.env.STRIPE_PRICE_PRO || "price_pro",
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    description: "5,000 credits per month",
    price: 79.99,
    credits: 5000,
    features: ["Enterprise AI video generation", "4K quality", "Dedicated support", "Custom branding", "API access"],
    stripePriceId: process.env.STRIPE_PRICE_BUSINESS || "price_business",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom credits allocation",
    price: 299.99,
    credits: 20000,
    features: [
      "Unlimited AI video generation",
      "4K quality",
      "Dedicated account manager",
      "Custom branding",
      "API access",
      "SLA guarantees",
    ],
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || "price_enterprise",
  },
]

export const CREDIT_PACKS = [
  {
    id: "small",
    name: "Small Pack",
    description: "100 credits",
    price: 4.99,
    credits: 100,
    stripePriceId: process.env.STRIPE_PRICE_SMALL_PACK || "price_small_pack",
  },
  {
    id: "medium",
    name: "Medium Pack",
    description: "500 credits",
    price: 19.99,
    credits: 500,
    stripePriceId: process.env.STRIPE_PRICE_MEDIUM_PACK || "price_medium_pack",
  },
  {
    id: "large",
    name: "Large Pack",
    description: "1,000 credits",
    price: 34.99,
    credits: 1000,
    stripePriceId: process.env.STRIPE_PRICE_LARGE_PACK || "price_large_pack",
  },
  {
    id: "xlarge",
    name: "Extra Large Pack",
    description: "2,500 credits",
    price: 74.99,
    credits: 2500,
    stripePriceId: process.env.STRIPE_PRICE_XLARGE_PACK || "price_xlarge_pack",
  },
]

export function getPlanById(planId: string) {
  return PLANS.find((plan) => plan.id === planId)
}

export function getCreditPackById(packId: string) {
  return CREDIT_PACKS.find((pack) => pack.id === packId)
}
