import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Category {
  id: number
  companyId: number
  name: string
  type: string
  parentCategoryId: number | null
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const { register, handleSubmit, reset } = useForm<Category>()

  const onSubmit = (data: Category) => {
    const newCategory = { ...data, id: Date.now() }
    setCategories([...categories, newCategory])
    reset()
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
        </CardHeader>
        <CardContent>
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
            <Button type="submit">Add Category</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-4">
                  <h3 className="font-bold">{category.name}</h3>
                  <p>Company ID: {category.companyId}</p>
                  <p>Type: {category.type}</p>
                  <p>Parent Category ID: {category.parentCategoryId || 'None'}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

