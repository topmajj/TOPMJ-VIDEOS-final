"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, BarChart, Clock, CreditCard, DollarSign, Gift, Info, RefreshCcw } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useSearchParams } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"

// Import plans and credit packs directly instead of from stripe.ts to avoid client-side errors
const PLANS = [
  {
    id: "basic",
    name: "Basic",
    description: "500 credits per month",
    price: 9.99,
    credits: 500,
    features: ["Basic AI video generation", "Standard quality", "Email support"],
  },
  {
    id: "pro",
    name: "Pro",
    description: "1,500 credits per month",
    price: 24.99,
    credits: 1500,
    features: ["Advanced AI video generation", "HD quality", "Priority support", "Custom avatars"],
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    description: "5,000 credits per month",
    price: 79.99,
    credits: 5000,
    features: ["Enterprise AI video generation", "4K quality", "Dedicated support", "Custom branding", "API access"],
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
  },
]

const CREDIT_PACKS = [
  {
    id: "small",
    name: "Small Pack",
    description: "100 credits",
    price: 4.99,
    credits: 100,
  },
  {
    id: "medium",
    name: "Medium Pack",
    description: "500 credits",
    price: 19.99,
    credits: 500,
  },
  {
    id: "large",
    name: "Large Pack",
    description: "1,000 credits",
    price: 34.99,
    credits: 1000,
  },
  {
    id: "xlarge",
    name: "Extra Large Pack",
    description: "2,500 credits",
    price: 74.99,
    credits: 2500,
  },
]

interface UsageCredit {
  id: string
  plan: string
  total: number
  used: number
  expires_at: string | null
  created_at: string
  updated_at: string
  user_id: string
}

interface Transaction {
  id: string
  amount: number
  description: string
  type: "purchase" | "usage" | "bonus"
  created_at: string
  user_id: string
  reference_id: string | null
}

interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  plan_id: string
  status: "active" | "canceled" | "past_due" | "unpaid" | "trialing"
  current_period_end: number
  created_at: string
}

export default function CreditsPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState<UsageCredit[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalCredits, setTotalCredits] = useState(0)
  const [purchaseAmount, setPurchaseAmount] = useState(500)
  const [purchasePlan, setPurchasePlan] = useState("Basic")
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [cancelingSubscription, setCancelingSubscription] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [stripeError, setStripeError] = useState<string | null>(null)
  const [fatoraLoading, setFatoraLoading] = useState<Record<string, boolean>>({})
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const fetchCreditsData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/credits")
      if (!response.ok) {
        throw new Error("Failed to fetch credits data")
      }

      const data = await response.json()

      // Filter out credits with 0 total value
      const filteredCredits = data.credits ? data.credits.filter((credit) => credit.total > 0) : []

      setCredits(filteredCredits)
      setTransactions(data.transactions || [])
      setTotalCredits(data.totalCredits || 0)
    } catch (error) {
      console.error("Error fetching credits data:", error)
      toast({
        title: getTranslation("common.error", language),
        description: getTranslation("credits.failedToLoadCredits", language),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/subscriptions")
      // Even if there's an error, we'll just set subscription to null
      const data = await response.json()
      setSubscription(data.subscription)
    } catch (error) {
      console.error("Error fetching subscription:", error)
      setSubscription(null)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCreditsData()
      fetchSubscription()
    }
  }, [user])

  useEffect(() => {
    // Check for success or canceled payment
    const success = searchParams.get("success")
    const canceled = searchParams.get("canceled")
    const provider = searchParams.get("provider")

    if (success === "true") {
      toast({
        title: getTranslation("credits.paymentSuccessful", language),
        description: getTranslation("credits.paymentSuccessfulDescription", language),
      })
      fetchCreditsData()
      fetchSubscription()

      // If it's a Fatora payment, verify it
      if (provider === "fatora" && user) {
        const orderId = searchParams.get("order_id")
        const transactionId = searchParams.get("transaction_id")
        const credits = searchParams.get("credits")
        const plan = searchParams.get("plan")

        if (orderId) {
          verifyFatoraPayment(orderId, transactionId, credits ? Number.parseInt(credits) : undefined, plan || undefined)
        }
      }
    } else if (canceled === "true") {
      toast({
        title: getTranslation("credits.paymentCanceled", language),
        description: getTranslation("credits.paymentCanceledDescription", language),
        variant: "destructive",
      })
    }
  }, [searchParams, toast, user, language])

  const handlePurchaseCredits = async () => {
    setPurchaseLoading(true)
    try {
      const response = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: purchasePlan,
          amount: purchaseAmount,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to purchase credits")
      }

      toast({
        title: getTranslation("common.success", language),
        description: getTranslation("credits.purchaseSuccess", language),
      })

      // Refresh credits data
      fetchCreditsData()
    } catch (error) {
      console.error("Error purchasing credits:", error)
      toast({
        title: getTranslation("common.error", language),
        description: error instanceof Error ? error.message : getTranslation("credits.purchaseFailed", language),
        variant: "destructive",
      })
    } finally {
      setPurchaseLoading(false)
    }
  }

  const handleCheckout = async (type: "plan" | "pack", id: string, mode: "subscription" | "payment") => {
    setCheckoutLoading(true)
    setStripeError(null)
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          id,
          mode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        setStripeError("No checkout URL returned. Please try again later.")
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      setStripeError(error instanceof Error ? error.message : "Failed to create checkout session")
      toast({
        title: getTranslation("common.error", language),
        description: error instanceof Error ? error.message : getTranslation("credits.checkoutFailed", language),
        variant: "destructive",
      })
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleFatoraCheckout = async (planName: string, packId: string) => {
    if (!user || !user.id || !user.email) {
      toast({
        title: getTranslation("common.error", language),
        description: getTranslation("credits.loginRequired", language),
        variant: "destructive",
      })
      return
    }

    console.log("Fatora checkout clicked for plan:", planName)

    // Set loading state for this specific button
    setFatoraLoading((prev) => ({ ...prev, [packId]: true }))

    try {
      // Get price based on plan
      let price = 0
      let credits = 0
      if (planName === "Small Pack") {
        price = 4.99
        credits = 100
      } else if (planName === "Medium Pack") {
        price = 19.99
        credits = 500
      } else if (planName === "Large Pack") {
        price = 34.99
        credits = 1000
      } else if (planName === "Extra Large Pack") {
        price = 74.99
        credits = 2500
      } else if (planName === "Pro") {
        price = 29
        credits = 1500
      } else if (planName === "Business") {
        price = 99
        credits = 5000
      }

      if (price === 0) {
        toast({
          title: getTranslation("common.error", language),
          description: getTranslation("credits.invalidPlan", language),
          variant: "destructive",
        })
        return
      }

      // Generate a unique order ID
      const orderId = `order_${Date.now()}_${user.id.substring(0, 8)}`

      console.log("Creating Fatora payment:", {
        userId: user.id,
        userEmail: user.email,
        planName,
        orderId,
        amount: price,
      })

      // Call the real Fatora API endpoint
      const response = await fetch("/api/create-fatora-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          planName,
          orderId,
          amount: price,
        }),
      })

      console.log("Fatora API response status:", response.status)

      let data
      try {
        data = await response.json()
        console.log("Fatora API response data:", data)
      } catch (e) {
        console.error("Error parsing JSON response:", e)
        toast({
          title: getTranslation("common.error", language),
          description: getTranslation("credits.invalidResponse", language),
          variant: "destructive",
        })
        return
      }

      if (!response.ok) {
        console.error("Fatora API error:", data)
        toast({
          title: getTranslation("common.error", language),
          description: data.error || getTranslation("credits.paymentCreationFailed", language),
          variant: "destructive",
        })
        return
      }

      if (data.url) {
        console.log("Redirecting to Fatora payment URL:", data.url)
        window.location.href = data.url
      } else {
        console.error("No payment URL returned:", data)
        toast({
          title: getTranslation("common.error", language),
          description: getTranslation("credits.noPaymentUrl", language),
          variant: "destructive",
        })
      }
    } catch (err: any) {
      console.error("Fatora checkout error:", err)
      toast({
        title: getTranslation("common.error", language),
        description: err.message || getTranslation("credits.errors.unknown", language),
        variant: "destructive",
      })
    } finally {
      setFatoraLoading((prev) => ({ ...prev, [packId]: false }))
    }
  }

  const handleCancelSubscription = async () => {
    setCancelingSubscription(true)
    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to cancel subscription")
      }

      toast({
        title: getTranslation("credits.subscriptionCanceled", language),
        description: getTranslation("credits.subscriptionCanceledDescription", language),
      })

      fetchSubscription()
    } catch (error) {
      console.error("Error canceling subscription:", error)
      toast({
        title: getTranslation("common.error", language),
        description: error instanceof Error ? error.message : getTranslation("credits.cancelFailed", language),
        variant: "destructive",
      })
    } finally {
      setCancelingSubscription(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create portal session")
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error("Error creating portal session:", error)
      toast({
        title: getTranslation("common.error", language),
        description: error instanceof Error ? error.message : getTranslation("credits.portalFailed", language),
        variant: "destructive",
      })
    }
  }

  const verifyFatoraPayment = async (orderId: string, transactionId?: string, credits?: number, plan?: string) => {
    try {
      const response = await fetch("/api/verify-fatora-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          transactionId,
          credits,
          planName: plan,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.verified) {
        console.error("Fatora payment verification failed:", data)
        toast({
          title: getTranslation("credits.paymentVerificationFailed", language),
          description: data.error || getTranslation("credits.failedToVerifyPayment", language),
          variant: "destructive",
        })
        return
      }

      if (data.updated) {
        toast({
          title: getTranslation("credits.paymentVerified", language),
          description: getTranslation("credits.planActive", language).replace("{plan}", data.plan),
        })

        // Refresh credits data
        fetchCreditsData()
      }
    } catch (error) {
      console.error("Error verifying Fatora payment:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getExpiryText = (expiryDate: string | null) => {
    if (!expiryDate) return getTranslation("credits.neverExpires", language)

    const daysLeft = Math.floor((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    if (daysLeft < 0) return getTranslation("credits.expired", language)
    if (daysLeft === 0) return getTranslation("credits.expiresInZero", language)
    if (daysLeft === 1) return getTranslation("credits.expiresInOne", language)
    return getTranslation("credits.expiresIn", language).replace("{days}", daysLeft.toString())
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <CreditCard className="h-4 w-4" />
      case "usage":
        return <Clock className="h-4 w-4" />
      case "bonus":
        return <Gift className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  // Calculate monthly usage
  const getMonthlyUsage = () => {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const monthlyUsage = transactions
      .filter((t) => t.type === "usage" && new Date(t.created_at) >= firstDayOfMonth)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return monthlyUsage
  }

  // Calculate previous month usage for comparison
  const getPreviousMonthUsage = () => {
    const now = new Date()
    const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const previousMonthUsage = transactions
      .filter((t) => {
        const date = new Date(t.created_at)
        return t.type === "usage" && date >= firstDayOfPreviousMonth && date < firstDayOfCurrentMonth
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return previousMonthUsage
  }

  const monthlyUsage = getMonthlyUsage()
  const previousMonthUsage = getPreviousMonthUsage()
  const usageChange =
    previousMonthUsage > 0 ? Math.round(((monthlyUsage - previousMonthUsage) / previousMonthUsage) * 100) : 0

  // Get current plan details
  const getCurrentPlan = () => {
    if (!subscription) return null
    return PLANS.find((plan) => plan.id === subscription.plan_id)
  }

  const currentPlan = getCurrentPlan()

  return (
    <div className="space-y-6">
      {stripeError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Stripe Configuration Error</AlertTitle>
          <AlertDescription>
            {stripeError}
            <div className="mt-2">
              Please contact support to resolve this issue. You can still use the manual credit purchase option below.
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {getTranslation("credits.availableCredits", language)}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCredits}</div>
            <p className="text-xs text-muted-foreground">
              {loading
                ? getTranslation("credits.loadingCredits", language)
                : `${credits.length} ${
                    credits.length === 1
                      ? getTranslation("credits.creditsActivePackage", language)
                      : getTranslation("credits.creditsActivePackages", language)
                  }`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{getTranslation("credits.monthlyUsage", language)}</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyUsage}</div>
            <p className="text-xs text-muted-foreground">
              {usageChange > 0 ? "+" : ""}
              {usageChange}% {getTranslation("credits.fromLastMonth", language)}
            </p>
          </CardContent>
        </Card>
        {/* Current Plan card temporarily hidden
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
    <CreditCard className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{currentPlan ? currentPlan.name : "No Plan"}</div>
    <p className="text-xs text-muted-foreground">
      {currentPlan ? `${currentPlan.credits} credits/month` : "Subscribe to a plan to get started"}
    </p>
  </CardContent>
  <CardFooter className="p-2">
    {subscription ? (
      <Button variant="outline" size="sm" className="w-full" onClick={handleManageSubscription}>
        Manage Subscription
      </Button>
    ) : (
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => handleCheckout("plan", "pro", "subscription")}
      >
        Upgrade Plan
      </Button>
    )}
  </CardFooter>
</Card>
*/}
      </div>

      <Tabs defaultValue="credits" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="credits">{getTranslation("credits.creditPackages", language)}</TabsTrigger>
          {/* <TabsTrigger value="plans">Subscription Plans</TabsTrigger> */}
          <TabsTrigger value="history">{getTranslation("credits.transactionHistory", language)}</TabsTrigger>
        </TabsList>

        <TabsContent value="credits" className="space-y-4 mt-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>{getTranslation("credits.creditUsage", language)}</AlertTitle>
            <AlertDescription>{getTranslation("credits.creditUsageDescription", language)}</AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {loading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    {getTranslation("credits.loadingCredits", language)}
                  </div>
                </CardContent>
              </Card>
            ) : credits.length > 0 ? (
              credits.map((credit) => (
                <Card key={credit.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{credit.plan} Credits</CardTitle>
                      <Badge variant={credit.expires_at ? "outline" : "secondary"}>
                        {getExpiryText(credit.expires_at)}
                      </Badge>
                    </div>
                    <CardDescription>
                      {getTranslation("credits.purchasedOn", language)} {formatDate(credit.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{getTranslation("credits.usage", language)}</span>
                        <span className="font-medium">
                          {credit.used} / {credit.total}
                        </span>
                      </div>
                      <Progress value={(credit.used / credit.total) * 100} />
                      <div className="pt-2 text-sm text-muted-foreground">
                        {credit.total - credit.used} {getTranslation("credits.creditsRemaining", language)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    {getTranslation("credits.noPackagesFound", language)}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {CREDIT_PACKS.map((pack) => (
              <Card key={pack.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{pack.name}</CardTitle>
                  <CardDescription>{pack.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-2xl font-bold">${pack.price}</div>
                  <p className="text-sm text-muted-foreground">{getTranslation("credits.oneTimePayment", language)}</p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button
                    className="w-full"
                    onClick={() => handleCheckout("pack", pack.id, "payment")}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading
                      ? getTranslation("common.processing", language)
                      : getTranslation("credits.payWithStripe", language)}
                  </Button>

                  {/* Fatora button hidden as requested */}
                  {false && (
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => handleFatoraCheckout(pack.name, pack.id)}
                      disabled={!user || fatoraLoading[pack.id]}
                    >
                      {fatoraLoading[pack.id]
                        ? getTranslation("common.processing", language)
                        : getTranslation("credits.payWithFatora", language)}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Fallback manual credit purchase if Stripe is not available */}
          {stripeError && (
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>{getTranslation("credits.manualCreditPurchase", language)}</CardTitle>
                  <CardDescription>{getTranslation("credits.manualCreditDescription", language)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="plan" className="text-right">
                        {getTranslation("credits.plan", language)}
                      </Label>
                      <Select value={purchasePlan} onValueChange={setPurchasePlan} defaultValue="Basic">
                        <SelectTrigger id="plan" className="col-span-3">
                          <SelectValue placeholder={getTranslation("credits.selectPlan", language)} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Basic">Basic</SelectItem>
                          <SelectItem value="Pro">Pro</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right">
                        {getTranslation("credits.amount", language)}
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(Number.parseInt(e.target.value))}
                        min={100}
                        step={100}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handlePurchaseCredits} disabled={purchaseLoading} className="w-full">
                    {purchaseLoading
                      ? getTranslation("common.processing", language)
                      : getTranslation("credits.purchaseCredits", language)}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Plans tab temporarily hidden
<TabsContent value="plans" className="space-y-4 mt-6">
          {subscription && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Current Subscription</AlertTitle>
              <AlertDescription>
                You are currently subscribed to the {currentPlan?.name} plan. Your subscription will{" "}
                {subscription.status === "canceled"
                  ? `end on ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}`
                  : "renew automatically"}
                .
              </AlertDescription>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={handleManageSubscription}>
                  Manage Subscription
                </Button>
                {subscription.status === "active" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCancelSubscription}
                    disabled={cancelingSubscription}
                  >
                    {cancelingSubscription ? "Canceling..." : "Cancel Subscription"}
                  </Button>
                )}
              </div>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan) => (
              <Card key={plan.id} className={`flex flex-col ${plan.popular ? "border-primary" : ""}`}>
                {plan.popular && <Badge className="absolute right-2 top-2">Popular</Badge>}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-2xl font-bold">${plan.price}</div>
                  <p className="text-sm text-muted-foreground">per month</p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleCheckout("plan", plan.id, "subscription")}
                    disabled={
                      checkoutLoading || (subscription?.plan_id === plan.id && subscription?.status === "active")
                    }
                  >
                    {checkoutLoading
                      ? "Processing..."
                      : subscription?.plan_id === plan.id && subscription?.status === "active"
                        ? "Current Plan"
                        : "Subscribe"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
*/}

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{getTranslation("credits.recentTransactions", language)}</CardTitle>
                <Button variant="ghost" size="sm" onClick={fetchCreditsData} disabled={loading}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  {getTranslation("mediaGeneration.refresh", language)}
                </Button>
              </div>
              <CardDescription>{getTranslation("credits.yourCreditUsage", language)}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-6 text-muted-foreground">
                  {getTranslation("credits.loadingCredits", language)}
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between border-b pb-2 last:border-0"
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              transaction.type === "usage"
                                ? "bg-destructive/10 text-destructive"
                                : transaction.type === "purchase"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-green-500/10 text-green-500"
                            }`}
                          >
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">{formatDateTime(transaction.created_at)}</p>
                          </div>
                        </div>
                        <div className="text-right font-medium">
                          {transaction.amount > 0 ? "+" : ""}
                          {transaction.amount}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      {getTranslation("credits.noTransactionsFound", language)}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <Button
                variant="outline"
                onClick={() => {
                  // In a real app, this would download a CSV or PDF
                  toast({
                    title: getTranslation("credits.statementDownload", language),
                    description: getTranslation("credits.statementDownloadDescription", language),
                  })
                }}
              >
                {getTranslation("credits.downloadStatement", language)}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
