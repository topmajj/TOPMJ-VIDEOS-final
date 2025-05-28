"use client"

import { useState } from "react"

export default function TestFatora() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runTest = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/test-fatora-curl")
      const data = await response.json()
      setResult(data)
      if (data.data?.result?.checkout_url) {
        // Optionally redirect to the checkout URL
        // window.location.href = data.data.result.checkout_url
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Fatora API</h1>

      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={runTest}
        disabled={loading}
      >
        {loading ? "Testing..." : "Test Fatora API"}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Response:</h2>
          <div className="mt-2 p-4 bg-gray-100 rounded overflow-auto">
            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>

          {result.data?.result?.checkout_url && (
            <div className="mt-4">
              <a
                href={result.data.result.checkout_url}
                target="_blank"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 inline-block"
                rel="noreferrer"
              >
                Open Checkout URL
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
