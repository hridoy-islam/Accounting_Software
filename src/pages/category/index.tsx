'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Pen, Plus, Trash } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Category {
  id: number
  name: string
  type: string
  parentCategoryId: number | null
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const { register, handleSubmit, reset } = useForm<Category>()

  const categoriesPerPage = 5

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
    { id: 10, name: 'Category 10', type: 'outflow', parentCategoryId: 4 },
  ];
  

  useEffect(() => {
    setCategories(initialCategories)
  }, [])

  const onSubmit = (data: Category) => {
    if (categoryToEdit) {
      setCategories(categories.map(category => category.id === categoryToEdit.id ? { ...categoryToEdit, ...data } : category))
    } else {
      const newCategory = { ...data, id: Date.now() }
      setCategories([...categories, newCategory])
    }
    reset()
    setIsDialogOpen(false)
    setCategoryToEdit(null)
  }

  const deleteCategory = (id: number) => {
    setCategories(categories.filter((category) => category.id !== id))
  }

  const editCategory = (category: Category) => {
    setIsDialogOpen(true)
    setCategoryToEdit(category)
    reset(category)
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * categoriesPerPage,
    currentPage * categoriesPerPage
  )

  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage)

  useEffect(() => {
    if (filteredCategories.length === 0) {
      setCurrentPage(1)
    } else if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [filteredCategories, totalPages])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Category Management</h1>
      
      <div className="flex justify-between items-center">
        <div className="flex-1 flex justify-between items-center space-x-4">
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <Button
            className="bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80"
            onClick={() => { setCategoryToEdit(null); setIsDialogOpen(true); }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Category
          </Button>
        </div>
      </div>

      <div className="rounded-md bg-white shadow-2xl p-4">
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
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    className="bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80 border-none"
                    size="icon"
                    onClick={() => editCategory(category)}
                  >
                    <Pen className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="bg-red-500 text-white hover:bg-red-500/90 border-none"
                    size="icon"
                    onClick={() => deleteCategory(category.id)}
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
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          Previous
        </Button>
        <div className="flex items-center gap-2">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        >
          Next
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{categoryToEdit ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
           
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Input id="name" {...register('name', { required: true })} />
            </div>
            <div>
              <Label htmlFor="type">Category Type</Label>
              <Input id="type" {...register('type', { required: true })} />
            </div>
            <div>
              <Label htmlFor="parentCategoryId">Parent Category ID</Label>
              <Input id="parentCategoryId" type="number" {...register('parentCategoryId')} />
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
  )
}

