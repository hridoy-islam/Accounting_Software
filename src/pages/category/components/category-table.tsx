import { useState } from "react"
import { Pen, Trash2 } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { CategoryDialog } from "./category-dialog"
import { Category } from "./category"

interface CategoryTableProps {
    type: 'inflow' | 'outflow'
    categories: Category[]
    onUpdate: (category: Category) => void
    onDelete: (id: string) => void
}

export function CategoryTable({ type, categories, onUpdate, onDelete }: CategoryTableProps) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | undefined>()

    // Function to build hierarchical structure
    const buildHierarchy = (categories: Category[]): Category[] => {
        const categoryMap = new Map<string, Category>()
        const roots: Category[] = []

        // First pass: Create map of categories
        categories.forEach(category => {
            categoryMap.set(category._id, { ...category, children: [] })
        })

        // Second pass: Build hierarchy
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

    // Render category row with proper indentation
    const renderCategoryRow = (category: Category, level: number = 0) => {
        return (
            <>
                <TableRow key={category._id}>
                    <TableCell>
                        <div style={{ marginLeft: `${level * 20}px` }} className="flex items-center">
                            {level > 0 && (
                                <span className="mr-2">└─</span>
                            )}
                            {category.name}
                        </div>
                    </TableCell>
                    <TableCell>{category.audit}</TableCell>
                    <TableCell>{category.status}</TableCell>
                    <TableCell className="text-right">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setEditingCategory(category)
                                setDialogOpen(true)
                            }}
                        >
                            <Pen className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(category._id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                </TableRow>
                {category.children?.map(child => renderCategoryRow(child, level + 1))}
            </>
        )
    }

    const filteredCategories = categories.filter(cat => cat.type === type)
    const hierarchicalCategories = buildHierarchy(filteredCategories)

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between mx-4 mb-2">
                <CardTitle>
                    {type === 'inflow' ? 'Inflow Categories' : 'Outflow Categories'}
                </CardTitle>
                <Button
                    variant='theme'
                    onClick={() => {
                        setEditingCategory(undefined)
                        setDialogOpen(true)
                    }}

                >
                    Add Category
                </Button>
            </CardHeader>
            <CardContent>
                <div className="">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category Name</TableHead>
                                <TableHead>Audit</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {hierarchicalCategories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        No categories found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                hierarchicalCategories.map(category => renderCategoryRow(category))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <CategoryDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                type={type}
                categories={categories}
                initialData={editingCategory}
                onSubmit={(data) => {
                    if (editingCategory) {
                        onUpdate({ ...editingCategory, ...data })
                    } else {
                        onUpdate({ type, ...data })
                    }
                    setDialogOpen(false)
                    setEditingCategory(undefined)
                }}
            />
        </Card>
    )
}

