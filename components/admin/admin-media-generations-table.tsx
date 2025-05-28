"use client"

import { useState } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { ArrowUpDown, Trash2, Eye, AlertCircle, CheckCircle, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface AdminMediaGenerationsTableProps {
  generations: any[]
  isLoading: boolean
  page: number
  limit: number
  total: number
  totalPages: number
  sortBy: string
  sortOrder: string
  onPageChange: (page: number) => void
  onSortChange: (column: string) => void
  onDelete: (id: string) => void
}

export default function AdminMediaGenerationsTable({
  generations,
  isLoading,
  page,
  limit,
  total,
  totalPages,
  sortBy,
  sortOrder,
  onPageChange,
  onSortChange,
  onDelete,
}: AdminMediaGenerationsTableProps) {
  const [previewGeneration, setPreviewGeneration] = useState<any | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handlePreview = (generation: any) => {
    setPreviewGeneration(generation)
  }

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id)
  }

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId)
      setDeleteConfirmId(null)
    }
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="ml-2 h-4 w-4" />
    return sortOrder === "asc" ? (
      <ArrowUpDown className="ml-2 h-4 w-4 rotate-180" />
    ) : (
      <ArrowUpDown className="ml-2 h-4 w-4" />
    )
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" /> Completed
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <Clock className="mr-1 h-3 w-3" /> Processing
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <AlertCircle className="mr-1 h-3 w-3" /> Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Preview</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => onSortChange("type")}
                  className="flex items-center p-0 font-medium"
                >
                  Type {getSortIcon("type")}
                </Button>
              </TableHead>
              <TableHead className="max-w-[300px]">Prompt</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => onSortChange("status")}
                  className="flex items-center p-0 font-medium"
                >
                  Status {getSortIcon("status")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => onSortChange("created_at")}
                  className="flex items-center p-0 font-medium"
                >
                  Created {getSortIcon("created_at")}
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: limit }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-12 w-12 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full max-w-[300px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-8 w-16" />
                  </TableCell>
                </TableRow>
              ))
            ) : generations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No media generations found.
                </TableCell>
              </TableRow>
            ) : (
              generations.map((generation) => (
                <TableRow key={generation.id}>
                  <TableCell>
                    {generation.input_image_url && generation.input_image_url !== "data-uri" ? (
                      <div className="relative h-12 w-12 overflow-hidden rounded-md">
                        <Image
                          src={generation.input_image_url || "/placeholder.svg"}
                          alt="Input image"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
                        <AlertCircle className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium capitalize">{generation.type}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{generation.prompt}</TableCell>
                  <TableCell>{renderStatusBadge(generation.status)}</TableCell>
                  <TableCell>{format(new Date(generation.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => handlePreview(generation)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Media Generation Details</DialogTitle>
                            <DialogDescription>View details and preview of the generated media</DialogDescription>
                          </DialogHeader>
                          {previewGeneration && (
                            <div className="grid gap-6 py-4">
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                  <h3 className="mb-2 font-semibold">Input Image</h3>
                                  {previewGeneration.input_image_url &&
                                  previewGeneration.input_image_url !== "data-uri" ? (
                                    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                                      <Image
                                        src={previewGeneration.input_image_url || "/placeholder.svg"}
                                        alt="Input image"
                                        fill
                                        className="object-contain"
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                                      <p className="text-sm text-gray-500">No input image</p>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h3 className="mb-2 font-semibold">Output</h3>
                                  {previewGeneration.status === "completed" && previewGeneration.output_url ? (
                                    previewGeneration.type === "video" ? (
                                      <video
                                        src={previewGeneration.output_url}
                                        controls
                                        className="aspect-video w-full rounded-lg"
                                      />
                                    ) : (
                                      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                                        <Image
                                          src={previewGeneration.output_url || "/placeholder.svg"}
                                          alt="Generated output"
                                          fill
                                          className="object-contain"
                                        />
                                      </div>
                                    )
                                  ) : (
                                    <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                                      <p className="text-sm text-gray-500">
                                        {previewGeneration.status === "failed" ? "Generation failed" : "Processing..."}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <h3 className="mb-1 font-semibold">Prompt</h3>
                                  <p className="text-sm">{previewGeneration.prompt}</p>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                  <div>
                                    <h3 className="mb-1 font-semibold">Status</h3>
                                    <p className="text-sm">{renderStatusBadge(previewGeneration.status)}</p>
                                  </div>
                                  <div>
                                    <h3 className="mb-1 font-semibold">Created</h3>
                                    <p className="text-sm">{format(new Date(previewGeneration.created_at), "PPpp")}</p>
                                  </div>
                                  <div>
                                    <h3 className="mb-1 font-semibold">User</h3>
                                    <p className="text-sm">
                                      {previewGeneration.user
                                        ? `${previewGeneration.user.first_name || ""} ${
                                            previewGeneration.user.last_name || ""
                                          }`.trim() || "Unknown"
                                        : "Unknown"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                            onClick={() => handleDeleteClick(generation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this media generation? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="mt-4 flex gap-2 sm:justify-start">
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button variant="destructive" onClick={confirmDelete}>
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{total > 0 ? (page - 1) * limit + 1 : 0}</span> to{" "}
          <span className="font-medium">{Math.min(page * limit, total)}</span> of{" "}
          <span className="font-medium">{total}</span> results
        </p>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  )
}
