import { NextResponse } from "next/server"
import { setupVideoBucketPolicies } from "@/lib/storage-actions"

export async function POST() {
  try {
    const result = await setupVideoBucketPolicies()

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }

    return NextResponse.json({ message: result.message })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred while setting up storage policies" },
      { status: 500 },
    )
  }
}
