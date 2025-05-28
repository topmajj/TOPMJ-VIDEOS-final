"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"

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

export function SubscriptionStatus() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchSubscription()
    }
  }, [user])

  const fetchSubscription = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/subscriptions")
      if (!response.ok) {
        throw new Error("Failed to fetch subscription data")
      }

      const data = await response.json()
      setSubscription(data.subscription)
    } catch (error) {
      console.error("Error fetching subscription:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Badge variant="outline">Loading...</Badge>
  }

  if (!subscription) {
    return <Badge variant="outline">Free</Badge>
  }

  if (subscription.status === "active") {
    return <Badge variant="default">Premium</Badge>
  }

  if (subscription.status === "canceled") {
    return <Badge variant="secondary">Canceled</Badge>
  }

  if (subscription.status === "past_due" || subscription.status === "unpaid") {
    return <Badge variant="destructive">Payment Issue</Badge>
  }

  if (subscription.status === "trialing") {
    return <Badge variant="outline">Trial</Badge>
  }

  return <Badge variant="outline">Unknown</Badge>
}
