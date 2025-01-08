import { useState } from "react";
import { Pen, Plus, Trash } from "lucide-react";
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

interface Method {
  id: number;
  name: string;
  active: boolean;
}

export function Method() {
  const [methods, setMethods] = useState<Method[]>([
    { id: 1, name: "Method 1", active: true },
    { id: 2, name: "Method 2", active: false },
    { id: 3, name: "Method 3", active: true },
    { id: 4, name: "Method 4", active: true },
    { id: 5, name: "Method 5", active: false },
    { id: 6, name: "Method 6", active: true },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<Method | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredMethods = methods.filter((method) =>
    method.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMethods.length / itemsPerPage);

  const paginatedMethods = filteredMethods.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = (data: Method) => {
    if (editingMethod) {
      setMethods(methods.map((method) => (method.id === editingMethod.id ? { ...method, ...data } : method)));
      setEditingMethod(null);
    } else {
      const newId = Math.max(...methods.map((m) => m.id), 0) + 1;
      setMethods([...methods, { id: newId, ...data, active: true }]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    setMethods(methods.filter((method) => method.id !== id));
  };

  const handleStatusChange = (id: number, active: boolean) => {
    setMethods(methods.map((method) => (method.id === id ? { ...method, active } : method)));
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6 ">
        <h1 className="text-2xl font-semibold">Methods</h1>
      <div className="flex justify-between items-center">
        <div className="flex-1 flex justify-between items-center space-x-4">
    <Input
      placeholder="Search methods..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="max-w-md"
    />
    <Button
      className="bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80"
      onClick={() => {
        setEditingMethod(null);
        setDialogOpen(true);
      }}
    >
      <Plus className="w-4 h-4 mr-2" />
      New Method
    </Button>
  </div>
      </div>
      <div className="rounded-md bg-white shadow-2xl p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Method Name</TableHead>
              <TableHead className="w-32 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMethods.map((method) => (
              <TableRow key={method.id}>
                <TableCell>{method.id}</TableCell>
                <TableCell>{method.name}</TableCell>
                <TableCell className="text-center space-x-2">
                  <Button
                    variant="ghost"
                    className="bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80 border-none"
                    size="icon"
                    onClick={() => {
                      setEditingMethod(method);
                      setDialogOpen(true);
                    }}
                  >
                    <Pen className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="bg-red-500 text-white hover:bg-red-500/90 border-none"
                    size="icon"
                    onClick={() => handleDelete(method.id)}
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
          if (!open) setEditingMethod(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMethod ? "Edit Method" : "New Method"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget as HTMLFormElement);
              const name = formData.get("name") as string;
              handleSubmit({ id: editingMethod?.id || 0, name, active: editingMethod?.active || true });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name">Method Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={editingMethod?.name || ""}
                required
              />
            </div>
            <Button
              className="hover:bg-[#a78bfa] hover:text-white"
              type="submit"
            >
              {editingMethod ? "Save Changes" : "Add Method"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
