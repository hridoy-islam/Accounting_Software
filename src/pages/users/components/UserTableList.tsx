'use client'

import { useState } from "react";
import { Pen, Plus, Trash } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface User {
  id: number;
  name: string;
  email: string;
}

export function UserTableList() {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
    { id: 3, name: "Alice Johnson", email: "alice@example.com" },
    { id: 4, name: "Bob Williams", email: "bob@example.com" },
    { id: 5, name: "Charlie Brown", email: "charlie@example.com" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = (data: User) => {
    if (editingUser) {
      setUsers(users.map((user) => (user.id === editingUser.id ? { ...user, ...data } : user)));
      setEditingUser(null);
    } else {
      const newId = Math.max(...users.map((u) => u.id), 0) + 1;
      setUsers([...users, { id: newId, ...data }]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">User Management</h1>
      <div className="flex justify-between items-center">
        <div className="flex-1 flex justify-between items-center space-x-4">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <Button
            className="bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80"
            onClick={() => {
              setEditingUser(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New User
          </Button>
        </div>
      </div>
      <div className="rounded-md bg-white shadow-2xl p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-32 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="text-center space-x-2">
                  <Button
                    variant="ghost"
                    className="bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80 border-none"
                    size="icon"
                    onClick={() => {
                      setEditingUser(user);
                      setDialogOpen(true);
                    }}
                  >
                    <Pen className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="bg-red-500 text-white hover:bg-red-500/90 border-none"
                    size="icon"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-4 items-center mt-4 space-y-2 sm:space-y-0">
        <Button
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          Previous
        </Button>
        <div className="flex items-center gap-2">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          Next
        </Button>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingUser(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "New User"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget as HTMLFormElement);
              const name = formData.get("name") as string;
              const email = formData.get("email") as string;
              handleSubmit({ id: editingUser?.id || 0, name, email });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={editingUser?.name || ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={editingUser?.email || ""}
                required
              />
            </div>
            <Button
              className="hover:bg-[#a78bfa] hover:text-white"
              type="submit"
            >
              {editingUser ? "Save Changes" : "Add User"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserTableList