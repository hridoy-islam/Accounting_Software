import { useState } from 'react';
import { Divide, Pen, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

interface Method {
  id: number;
  name: string;
  active: boolean;
}

export function Method() {
  const [methods, setMethods] = useState<Method[]>([
    { id: 1, name: 'Method 1', active: true },
    { id: 2, name: 'Method 2', active: false },
    { id: 3, name: 'Method 3', active: true },
    { id: 4, name: 'Method 4', active: true },
    { id: 5, name: 'Method 5', active: false },
    { id: 6, name: 'Method 6', active: true }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<Method | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredMethods = methods.filter((method) =>
    method.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (data: Method) => {
    if (editingMethod) {
      setMethods(
        methods.map((method) =>
          method.id === editingMethod.id ? { ...method, ...data } : method
        )
      );
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
    setMethods(
      methods.map((method) =>
        method.id === id ? { ...method, active } : method
      )
    );
  };

  return (
    <div className="space-y-4 rounded-lg bg-white shadow-md">
      {/* <Breadcrumbs
              items={[
                { title: 'Dashboard', link: '/admin' },
                { title: 'Method', link: '/methods' }
              ]}
            /> */}

      <div className="p-4 ">
        <h1 className=" pb-6 text-2xl font-semibold">Methods</h1>

        <div className="flex  justify-between ">
          <Input
            placeholder="Search methods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md border-2"
          />
          <Button
            variant="theme"
            onClick={() => {
              setEditingMethod(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Method
          </Button>
        </div>
      </div>
      <div className="space-x-1">
        <div className="p-4">
          <Table className="">
            <TableHeader>
              <TableRow>
                <TableHead>Method Name</TableHead>
                <TableHead className="w-32 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {methods.map((method) => (
                <TableRow key={method.id}>
                  <TableCell>{method.name}</TableCell>
                  <TableCell className="space-x-4 text-center ">
                    <Button
                      variant="ghost"
                      className="border-none bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80"
                      size="icon"
                      onClick={() => {
                        setEditingMethod(method);
                        setDialogOpen(true);
                      }}
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="border-none bg-red-500 text-white hover:bg-red-500/90"
                      size="icon"
                      onClick={() => handleDelete(method.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              <DialogTitle>
                {editingMethod ? 'Edit Method' : 'New Method'}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(
                  e.currentTarget as HTMLFormElement
                );
                const name = formData.get('name') as string;
                handleSubmit({
                  id: editingMethod?.id || 0,
                  name,
                  active: editingMethod?.active || true
                });
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="name">Method Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingMethod?.name || ''}
                  required
                />
              </div>
              <Button variant="theme" type="submit">
                {editingMethod ? 'Save Changes' : 'Add Method'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
