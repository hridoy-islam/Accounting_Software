import { useState } from "react";
import { Pen, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { Pagination } from "@/components/ui/pagination"; // Assumed custom Pagination component

interface Method {
  id: number;
  name: string;
  active: boolean;
}

export function MethodManagement() {
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

  const paginatedMethods = filteredMethods.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = (data: Method) => {
    if (editingMethod) {
      // Update existing method
      setMethods(methods.map((method) => (method.id === editingMethod.id ? { ...method, ...data } : method)));
      setEditingMethod(null);
    } else {
      // Add new method
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Method Management</h1>
        <div className="flex space-x-2">
          <Input
            placeholder="Search methods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            className="bg-supperagent text-white hover:bg-supperagent/90"
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
              <TableHead>#ID</TableHead>
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
                    className="bg-supperagent text-white hover:bg-supperagent/90 border-none"
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
      <Pagination
        totalItems={filteredMethods.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
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
            <Button type="submit">{editingMethod ? "Save Changes" : "Add Method"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
