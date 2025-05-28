"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"

export default function ConfirmPage() {
  const [isConfirming, setIsConfirming] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Get the token and type from the URL
        const token = searchParams.get("token")
        const type = searchParams.get("type")

        if (!token || type !== "email_confirmation") {
          setIsSuccess(false)
          setErrorMessage("Invalid confirmation link")
          setIsConfirming(false)
          return
        }

        // Verify the email
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email_confirmation",
        })

        if (error) {
          setIsSuccess(false)
          setErrorMessage(error.message)
        } else {
          setIsSuccess(true)
        }
      } catch (error: any) {
        setIsSuccess(false)
        setErrorMessage(error.message || "An error occurred")
      } finally {
        setIsConfirming(false)
      }
    }

    confirmEmail()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            {isConfirming ? (
              <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            ) : isSuccess ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle className="h-8 w-8" />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <XCircle className="h-8 w-8" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {isConfirming ? "Confirming your email" : isSuccess ? "Email confirmed!" : "Confirmation failed"}
          </CardTitle>
          <CardDescription>
            {isConfirming
              ? "Please wait while we confirm your email address..."
              : isSuccess
                ? "Your email has been successfully confirmed. You can now sign in to your account."
                : errorMessage || "There was a problem confirming your email. Please try again."}
          </CardDescription>
        </CardHeader>
        {!isConfirming && (
          <CardFooter className="flex flex-col space-y-4">
            <Button asChild className="w-full" onClick={() => router.push("/login")}>
              <a href="/login">Go to login</a>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
