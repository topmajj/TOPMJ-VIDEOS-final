"use client"

import { useState } from "react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { MoreHorizontal, ArrowUpDown, Shield, ShieldOff, Trash2, Edit, Eye } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  profile: {
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
    is_admin: boolean
    created_at: string
    updated_at: string | null
  }
}

interface AdminUsersTableProps {
  users: User[]
  onUserUpdated: () => void
}

export default function AdminUsersTable({ users, onUserUpdated }: AdminUsersTableProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    is_admin: false,
  })

  const router = useRouter()
  const { toast } = useToast()

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const toggleSelectAll = () => {
    setSelectedUsers((prev) => (prev.length === users.length ? [] : users.map((user) => user.id)))
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setFormData({
      first_name: user.profile?.first_name || "",
      last_name: user.profile?.last_name || "",
      email: user.email || "",
      is_admin: user.profile?.is_admin || false,
    })
  }

  const handleViewUser = (user: User) => {
    setViewingUser(user)
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
  }

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: {
            is_admin: !currentStatus,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update user")
      }

      toast({
        title: "User updated",
        description: `Admin status ${!currentStatus ? "granted" : "revoked"} successfully`,
      })

      onUserUpdated()
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update user admin status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const saveUserChanges = async () => {
    if (!editingUser) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email !== editingUser.email ? formData.email : undefined,
          profile: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            is_admin: formData.is_admin,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update user")
      }

      toast({
        title: "User updated",
        description: "User information updated successfully",
      })

      setEditingUser(null)
      onUserUpdated()
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update user information",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete user")
      }

      toast({
        title: "User deleted",
        description: "User has been deleted successfully",
      })

      setUserToDelete(null)
      onUserUpdated()
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (users.length === 0) {
    return <p className="text-center text-sm text-muted-foreground py-8">No users found</p>
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all users"
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>
                <div className="flex items-center">
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  Joined
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Last Sign In</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className={selectedUsers.includes(user.id) ? "bg-muted/50" : undefined}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => toggleUserSelection(user.id)}
                    aria-label={`Select user ${user.profile?.first_name || user.email || user.id}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white">
                        {user.profile?.first_name?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {user.profile?.first_name
                          ? `${user.profile.first_name} ${user.profile.last_name || ""}`
                          : user.email?.split("@")[0] || "Anonymous User"}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email || "No email"}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {user.profile?.is_admin ? (
                    <Badge className="bg-purple-600 hover:bg-purple-700">Admin</Badge>
                  ) : (
                    <Badge variant="outline">User</Badge>
                  )}
                </TableCell>
                <TableCell>{format(new Date(user.created_at), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  {user.last_sign_in_at ? format(new Date(user.last_sign_in_at), "MMM d, yyyy") : "Never"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleViewUser(user)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditUser(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit user
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => toggleAdminStatus(user.id, user.profile?.is_admin || false)}
                        disabled={isUpdating}
                      >
                        {user.profile?.is_admin ? (
                          <>
                            <ShieldOff className="mr-2 h-4 w-4" />
                            Remove admin rights
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            Make admin
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete user
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Make changes to the user profile. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="first_name" className="text-right">
                First Name
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="last_name" className="text-right">
                Last Name
              </Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_admin" className="text-right">
                Admin
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="is_admin"
                  checked={formData.is_admin}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_admin: checked })}
                />
                <Label htmlFor="is_admin">{formData.is_admin ? "Administrator" : "Regular User"}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={saveUserChanges} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={!!viewingUser} onOpenChange={(open) => !open && setViewingUser(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Detailed information about the user.</DialogDescription>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={viewingUser.profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white text-xl">
                    {viewingUser.profile?.first_name?.[0] || viewingUser.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">
                    {viewingUser.profile?.first_name
                      ? `${viewingUser.profile.first_name} ${viewingUser.profile.last_name || ""}`
                      : viewingUser.email?.split("@")[0] || "Anonymous User"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{viewingUser.email}</p>
                  {viewingUser.profile?.is_admin && <Badge className="mt-1 bg-purple-600">Administrator</Badge>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">User ID</h4>
                  <p className="text-sm break-all">{viewingUser.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                  <p className="text-sm">{format(new Date(viewingUser.created_at), "PPpp")}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Last Sign In</h4>
                  <p className="text-sm">
                    {viewingUser.last_sign_in_at ? format(new Date(viewingUser.last_sign_in_at), "PPpp") : "Never"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Profile Updated</h4>
                  <p className="text-sm">
                    {viewingUser.profile?.updated_at
                      ? format(new Date(viewingUser.profile.updated_at), "PPpp")
                      : "Never"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingUser(null)}>
              Close
            </Button>
            {viewingUser && (
              <Button
                onClick={() => {
                  setViewingUser(null)
                  handleEditUser(viewingUser)
                }}
              >
                Edit User
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and remove their data from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
              disabled={isUpdating}
            >
              {isUpdating ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
