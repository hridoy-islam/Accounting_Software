import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"


interface Category {
  id: number
  companyId: number
  name: string
  type: string
  parentCategoryId: number | null
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)
  const [currentPage, setCurrentPage] = useState(1) // Set initial page to 1
  const [searchQuery, setSearchQuery] = useState('')
  const { register, handleSubmit, reset } = useForm<Category>()

  const categoriesPerPage = 6

  const initialCategories: Category[] = [
    { id: 1, companyId: 101, name: 'Category 1', type: 'Type A', parentCategoryId: null },
    { id: 2, companyId: 101, name: 'Category 2', type: 'Type B', parentCategoryId: null },
    { id: 3, companyId: 102, name: 'Category 3', type: 'Type A', parentCategoryId: null },
    { id: 4, companyId: 103, name: 'Category 4', type: 'Type C', parentCategoryId: 1 },
    { id: 5, companyId: 104, name: 'Category 5', type: 'Type B', parentCategoryId: null },
    { id: 6, companyId: 105, name: 'Category 6', type: 'Type A', parentCategoryId: 2 },
    { id: 7, companyId: 106, name: 'Category 7', type: 'Type C', parentCategoryId: 3 },
    { id: 8, companyId: 107, name: 'Category 8', type: 'Type B', parentCategoryId: null },
    { id: 9, companyId: 108, name: 'Category 9', type: 'Type A', parentCategoryId: 5 },
    { id: 10, companyId: 109, name: 'Category 10', type: 'Type C', parentCategoryId: 4 },
  ]

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

  // Adjust currentPage if needed when data is added or deleted
  useEffect(() => {
    // Reset to page 1 if there are no categories
    if (filteredCategories.length === 0) {
      setCurrentPage(1)
    } else {
      // Ensure currentPage is within valid bounds
      if (currentPage > totalPages) {
        setCurrentPage(totalPages)
      }
    }
  }, [filteredCategories, totalPages])

  return (
    <div className="space-y-8">
      
      <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{categoryToEdit ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="companyId">Company ID</Label>
              <Input id="companyId" type="number" {...register('companyId', { required: true })} />
            </div>
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
            <Button type="submit">{categoryToEdit ? 'Save Changes' : 'Add Category'}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Centered Search Input and Add New Category Button */}
      <div className="flex justify-center space-x-4">
        <Input
          placeholder="Search Categories"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-xs"
        />
        <Button onClick={() => { setCategoryToEdit(null); setIsDialogOpen(true); }} className=" hover:bg-black hover:text-white">
          Add Category
        </Button>
      </div>

      {/* Category Profiles Table */}
      <div className="w-full flex justify-center">
        <Card className="w-full sm:w-3/4 lg:w-2/3">
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="border-b px-4 py-2 text-left">Category Name</th>
                      <th className="border-b px-4 py-2 text-left">Company ID</th>
                      <th className="border-b px-4 py-2 text-left">Type</th>
                      <th className="border-b px-4 py-2 text-left">Parent Category ID</th>
                      <th className="border-b px-4 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCategories.map((category) => (
                      <tr key={category.id}>
                        <td className="border-b px-4 py-2">{category.name}</td>
                        <td className="border-b px-4 py-2">{category.companyId}</td>
                        <td className="border-b px-4 py-2">{category.type}</td>
                        <td className="border-b px-4 py-2">{category.parentCategoryId || 'None'}</td>
                        <td className="border-b px-4 py-2 text-right">
                          <Button onClick={() => editCategory(category)} className="mr-2">Edit</Button>
                          <Button onClick={() => deleteCategory(category.id)} variant="destructive">
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-2 sm:space-y-0">
                <Button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
