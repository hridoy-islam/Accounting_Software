import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Category } from "@/types"
import { Label } from "@/components/ui/label"

export function CategorySelector({
  categories,
  onSelect,
  onTypeChange,
  defaultType = '',
  value
}: {
  categories: Category[];
  onSelect: (categoryId: string) => void;
  onTypeChange: (type: 'inflow' | 'outflow') => void;
  defaultType?: 'inflow' | 'outflow';
  value: string;
}) {
  const [type, setType] = useState<'inflow' | 'outflow' | ''>(defaultType)
  const [selectedCategory, setSelectedCategory] = useState<string>(value)

  useEffect(() => {
    setSelectedCategory(value)
  }, [value])

  useEffect(() => {
    setSelectedCategory('')
  }, [type])

  const handleTypeChange = (value: 'inflow' | 'outflow') => {
    setType(value)
    onTypeChange(value)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    onSelect(value)
  }

  const buildHierarchy = (categories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>()
    const roots: Category[] = []

    categories.forEach(category => {
      categoryMap.set(category._id, { ...category, children: [] })
    })

    categories.forEach(category => {
      const currentCategory = categoryMap.get(category._id)!
      if (category.parentId && category.parentId !== "none") {
        const parent = categoryMap.get(category.parentId)
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(currentCategory)
        } else {
          roots.push(currentCategory)
        }
      } else {
        roots.push(currentCategory)
      }
    })

    return roots
  }

  const renderCategoryOptions = (categories: Category[], level: number = 0): JSX.Element[] => {
    return categories.flatMap(category => [
      <SelectItem key={category._id} value={category._id} className='hover:bg-black hover:text-white'>
        {'\u00A0'.repeat(level * 2)}
        {level > 0 ? '└─ ' : ''}
        {category.name}
      </SelectItem>,
      ...(category.children ? renderCategoryOptions(category.children, level + 1) : [])
    ])
  }

  const filteredCategories = categories.filter(category => category.type === type)
  const hierarchicalCategories = buildHierarchy(filteredCategories)

  return (
    <div className="flex gap-4 items-center">
      <Select value={selectedCategory} onValueChange={handleCategoryChange}>
        <SelectTrigger className="min-w-[50px]">
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {renderCategoryOptions(hierarchicalCategories)}
        </SelectContent>
      </Select>
    </div>
  )
}
