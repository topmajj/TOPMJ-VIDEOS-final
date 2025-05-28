import type { Metadata } from "next"

import AdminSubscriptionsContent from "@/components/admin/admin-subscriptions-content"

export const metadata: Metadata = {
  title: "Admin Subscriptions | AI Videos",
  description: "Manage user subscriptions and transactions",
}

export default function AdminSubscriptionsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">View all transactions in the system</p>
      </div>
      <AdminSubscriptionsContent />
    </div>
  )
}
