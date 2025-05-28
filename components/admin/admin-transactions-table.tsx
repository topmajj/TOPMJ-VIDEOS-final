"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/ui/pagination"
import { Eye } from "lucide-react"

interface Transaction {
  id: string
  user_id: string
  amount: string
  description: string
  type: string
  reference_id: string
  created_at: string
}

interface AdminTransactionsTableProps {
  transactions: Transaction[]
  isLoading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function AdminTransactionsTable({
  transactions,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}: AdminTransactionsTableProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsViewDialogOpen(true)
  }

  const formatAmount = (amount: string, type: string) => {
    const numAmount = Number.parseFloat(amount)
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      signDisplay: "auto",
    }).format(numAmount)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a")
    } catch (error) {
      return dateString
    }
  }

  const renderTransactionType = (type: string) => {
    switch (type) {
      case "purchase":
        return <Badge className="bg-green-500">Purchase</Badge>
      case "usage":
        return <Badge className="bg-blue-500">Usage</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                </TableRow>
              ))
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{formatDate(transaction.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium truncate max-w-[200px]">{transaction.user_id}</span>
                    </div>
                  </TableCell>
                  <TableCell>{renderTransactionType(transaction.type)}</TableCell>
                  <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      transaction.type === "purchase"
                        ? "text-green-600 dark:text-green-400"
                        : transaction.type === "usage"
                          ? "text-blue-600 dark:text-blue-400"
                          : ""
                    }`}
                  >
                    {formatAmount(transaction.amount, transaction.type)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewTransaction(transaction)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />}

      {/* View Transaction Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>Detailed information about this transaction.</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">ID:</span>
                <span className="col-span-2 text-sm break-all">{selectedTransaction.id}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">User ID:</span>
                <span className="col-span-2 text-sm break-all">{selectedTransaction.user_id}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Type:</span>
                <span className="col-span-2 text-sm">{renderTransactionType(selectedTransaction.type)}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Amount:</span>
                <span
                  className={`col-span-2 text-sm font-medium ${
                    selectedTransaction.type === "purchase"
                      ? "text-green-600 dark:text-green-400"
                      : selectedTransaction.type === "usage"
                        ? "text-blue-600 dark:text-blue-400"
                        : ""
                  }`}
                >
                  {formatAmount(selectedTransaction.amount, selectedTransaction.type)}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Description:</span>
                <span className="col-span-2 text-sm">{selectedTransaction.description}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Reference ID:</span>
                <span className="col-span-2 text-sm break-all">{selectedTransaction.reference_id}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Date:</span>
                <span className="col-span-2 text-sm">{formatDate(selectedTransaction.created_at)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
