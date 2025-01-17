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
  id: string;
  name: string;
  type: string;
  parentCategoryId: string | null;
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const { register, handleSubmit, reset, watch } = useForm<Category>();
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredCategories = categories.filter((category) => {
    const matchesName = category.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = filterType ? category.type === filterType : true;
    return matchesName && matchesType;
  });

  const categoriesPerPage = 5;

  const initialCategories: Category[] = [
    { id: '1', name: 'Salary', type: 'inflow', parentCategoryId: null },
    { id: '2', name: 'Category 2', type: 'outflow', parentCategoryId: '3' },
    { id: '3', name: 'Category 3', type: 'inflow', parentCategoryId: '1' },
    { id: '4', name: 'Category 4', type: 'outflow', parentCategoryId: '1' },
    { id: '5', name: 'Category 5', type: 'inflow', parentCategoryId: '3' },
    { id: '6', name: 'Category 6', type: 'outflow', parentCategoryId: '2' },
    { id: '7', name: 'Category 7', type: 'inflow', parentCategoryId: '3' },
    { id: '8', name: 'Category 8', type: 'outflow', parentCategoryId: '2' },
    { id: '9', name: 'Category 9', type: 'inflow', parentCategoryId: '5' },
    { id: '10', name: 'Category 10', type: 'outflow', parentCategoryId: '4' }
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
      const newCategory = { ...data, id: Date.now().toString() };
      setCategories([...categories, newCategory]);
    }
    reset();
    setIsDialogOpen(false);
    setCategoryToEdit(null);
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter((category) => category.id !== id));
  };

  const editCategory = (category: Category) => {
    setIsDialogOpen(true);
    setCategoryToEdit(category);
    reset(category);
  };

  // const filteredCategories = categories.filter((category) =>
  //   category.name.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  return (
    <div className="bg-whitespace-y-4 space-y-4 rounded-lg bg-white shadow-md">
      <div className="p-4">
        <h1 className=" pb-6 text-2xl font-semibold">Category Management</h1>

        <div className="flex items-center justify-between pb-10">
          <div className="flex flex-1 items-center justify-between space-x-4">
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md border-2"
            />

            <div className="flex gap-4 items-center ">
              <select
                value={filterType || ''}
                onChange={(e) => setFilterType(e.target.value || null)}
                className="max-w-md rounded-lg border border-gray-400 bg-transparent bg-white p-1.5"
              >
                <option value="">All Types</option>
                <option value="inflow">Inflow</option>
                <option value="outflow">Outflow</option>
              </select>

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
        </div>

        <div className="">
          <Table>
            <TableHeader>
              <TableRow>
             
                <TableHead>Category Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Parent Category ID</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
          
                  <TableCell >{category.name}</TableCell>
                  <TableCell >{category.type}</TableCell>
                  <TableCell >
                    {categories.find(
                      (cat) => cat.id === category.parentCategoryId
                    )?.name || 'None'}
                  </TableCell>
                  <TableCell className="space-x-4 ">
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
              <div className="flex flex-col items-start gap-2 ">
                <Label htmlFor="type">Category Type</Label>
                <select
                  id="type"
                  {...register('type', { required: true })}
                  className="w-1/2 rounded-lg border border-gray-400 bg-transparent p-2"
                >
                  <option value="" disabled selected>
                    Select category type
                  </option>
                  <option value="inflow">Inflow</option>
                  <option value="outflow">Outflow</option>
                </select>
              </div>

              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  {...register('name', { required: true })}
                  placeholder="Enter category name"
                />
              </div>

              <div className="flex flex-col items-start gap-2 ">
                <Label htmlFor="parentCategoryId">Parent Category</Label>
                <select
                  id="parentCategoryId"
                  {...register('parentCategoryId')}
                  className="w-1/2 rounded-lg border border-gray-400 bg-transparent p-2"
                >
                  <option value="">No Parent</option>
                  {categories
                    .filter(
                      (cat) =>
                        cat.type === watch('type') &&
                        cat.id !== categoryToEdit?.id
                    )
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
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
