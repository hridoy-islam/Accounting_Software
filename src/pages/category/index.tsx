'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Pen, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

interface Category {
  id: number;
  name: string;
  type: string;
  parentCategoryId: number | null;
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const { register, handleSubmit, reset } = useForm<Category>();

  const categoriesPerPage = 5;

  const initialCategories: Category[] = [
    { id: 1, name: 'Salary', type: 'inflow', parentCategoryId: null },
    { id: 2, name: 'Category 2', type: 'outflow', parentCategoryId: 3 },
    { id: 3, name: 'Category 3', type: 'inflow', parentCategoryId: 1 },
    { id: 4, name: 'Category 4', type: 'outflow', parentCategoryId: 1 },
    { id: 5, name: 'Category 5', type: 'inflow', parentCategoryId: 3 },
    { id: 6, name: 'Category 6', type: 'outflow', parentCategoryId: 2 },
    { id: 7, name: 'Category 7', type: 'inflow', parentCategoryId: 3 },
    { id: 8, name: 'Category 8', type: 'outflow', parentCategoryId: 2 },
    { id: 9, name: 'Category 9', type: 'inflow', parentCategoryId: 5 },
    { id: 10, name: 'Category 10', type: 'outflow', parentCategoryId: 4 }
  ];

  useEffect(() => {
    setCategories(initialCategories);
  }, []);

  const onSubmit = (data: Category) => {
    if (categoryToEdit) {
      setCategories(
        categories.map((category) =>
          category.id === categoryToEdit.id
            ? { ...categoryToEdit, ...data }
            : category
        )
      );
    } else {
      const newCategory = { ...data, id: Date.now() };
      setCategories([...categories, newCategory]);
    }
    reset();
    setIsDialogOpen(false);
    setCategoryToEdit(null);
  };

  const deleteCategory = (id: number) => {
    setCategories(categories.filter((category) => category.id !== id));
  };

  const editCategory = (category: Category) => {
    setIsDialogOpen(true);
    setCategoryToEdit(category);
    reset(category);
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * categoriesPerPage,
    currentPage * categoriesPerPage
  );

  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

  useEffect(() => {
    if (filteredCategories.length === 0) {
      setCurrentPage(1);
    } else if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredCategories, totalPages]);

  return (
    <div className="space-y-4 p-4 md:p-8">
      <Breadcrumbs
        items={[
          { title: 'Dashboard', link: '/admin' },
          { title: 'Category', link: '/categories' }
        ]}
      />

      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Category Management</h1>

        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center justify-between space-x-4">
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <Button
              className="bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80"
              onClick={() => {
                setCategoryToEdit(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Button>
          </div>
        </div>

        <div className="rounded-md bg-white p-4 shadow-2xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category ID</TableHead>
                <TableHead>Category Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Parent Category ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.id}</TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.type}</TableCell>
                  <TableCell>{category.parentCategoryId || 'None'}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      variant="ghost"
                      className="border-none bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80"
                      size="icon"
                      onClick={() => editCategory(category)}
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="border-none bg-red-500 text-white hover:bg-red-500/90"
                      size="icon"
                      onClick={() => deleteCategory(category.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex flex-col items-center justify-center gap-4 space-y-2 sm:flex-row sm:space-y-0">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
          >
            Next
          </Button>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => setIsDialogOpen(open)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {categoryToEdit ? 'Edit Category' : 'New Category'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input id="name" {...register('name', { required: true })} />
              </div>
              <div>
                <Label htmlFor="type">Category Type</Label>
                <select
                  id="type"
                  {...register('type', { required: true })}
                  className="flex h-9 w-3/7 rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled selected>
                Select category type
              </option>
                  <option value="inflow">Inflow</option>
                  <option value="outflow">Outflow</option>
                </select>
              </div>
              <div>
                <Label htmlFor="parentCategoryId">Parent Category ID</Label>
                <Input
                  id="parentCategoryId"
                  type="number"
                  {...register('parentCategoryId')}
                />
              </div>
              <Button
                type="submit"
                className="bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80"
              >
                {categoryToEdit ? 'Save Changes' : 'Add Category'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
