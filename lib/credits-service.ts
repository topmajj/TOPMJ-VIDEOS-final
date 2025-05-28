import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export async function useCredits(amount: number, description: string) {
  const supabase = createClientComponentClient()

  try {
    const response = await fetch("/api/credits/use", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        description,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to use credits")
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Error using credits:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to use credits",
    }
  }
}

export async function getCreditsBalance() {
  const supabase = createClientComponentClient()

  try {
    const response = await fetch("/api/credits/balance")

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to get credits balance")
    }

    const data = await response.json()
    return { success: true, balance: data.balance }
  } catch (error) {
    console.error("Error getting credits balance:", error)
    return {
      success: false,
      balance: 0,
      error: error instanceof Error ? error.message : "Failed to get credits balance",
    }
  }
}
