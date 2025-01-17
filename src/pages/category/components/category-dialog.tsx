// import { useEffect } from "react"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import * as z from "zod"

// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { Input } from "@/components/ui/input"
// import { Category } from "@/types/category"

// const formSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   parentId: z.string().nullable(),
//   audit: z.enum(["Active", "Inactive"]),
//   status: z.enum(["Active", "Inactive"]),
// })

// interface CategoryDialogProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   type: 'inflow' | 'outflow'
//   categories: Category[]
//   initialData?: Category
//   onSubmit: (data: Omit<Category, 'id' | 'type'>) => void
// }

// export function CategoryDialog({
//   open,
//   onOpenChange,
//   type,
//   categories,
//   initialData,
//   onSubmit,
// }: CategoryDialogProps) {
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: "",
//       parentId: null,
//       audit: "Inactive",
//       status: "Active",
//     },
//   })

//   useEffect(() => {
//     if (initialData) {
//       form.reset({
//         name: initialData.name,
//         parentId: initialData.parentId,
//         audit: initialData.audit,
//         status: initialData.status,
//       })
//     } else {
//       form.reset({
//         name: "",
//         parentId: null,
//         audit: "Inactive",
//         status: "Active",
//       })
//     }
//   }, [initialData, form])

//   const handleSubmit = (values: z.infer<typeof formSchema>) => {
//     onSubmit(values)
//     form.reset()
//   }

//   // Filter categories of the same type for parent selection
//   const availableParents = categories.filter(cat => 
//     cat.type === type && cat.id !== initialData?.id
//   )

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>
//             {initialData ? "Edit Category" : `Add New ${type === 'inflow' ? 'Inflow' : 'Outflow'} Category`}
//           </DialogTitle>
//         </DialogHeader>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
//             <FormField
//               control={form.control}
//               name="name"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Name</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Enter category name" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="parentId"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Parent Category</FormLabel>
//                   <Select
//                     onValueChange={field.onChange}
//                     defaultValue={field.value || undefined}
//                   >
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select parent category" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="none">None</SelectItem>
//                       {availableParents.map((category) => (
//                         <SelectItem key={category.id} value={category.id}>
//                           {category.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="audit"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Audit</FormLabel>
//                   <Select onValueChange={field.onChange} defaultValue={field.value}>
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select audit status" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="Active">Active</SelectItem>
//                       <SelectItem value="Inactive">Inactive</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="status"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Status</FormLabel>
//                   <Select onValueChange={field.onChange} defaultValue={field.value}>
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="Active">Active</SelectItem>
//                       <SelectItem value="Inactive">Inactive</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="flex justify-end space-x-2">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => onOpenChange(false)}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
//                 {initialData ? "Update Category" : "Add Category"}
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   )
// }

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Category } from "@/types/category"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  parentId: z.string().nullable(),
  audit: z.string().min(1, "Audit status is required"),
  status: z.enum(["Active", "Inactive"]),
})

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'inflow' | 'outflow'
  categories: Category[]
  initialData?: Category
  onSubmit: (data: Omit<Category, '_id' | 'type'>) => void
}

export function CategoryDialog({
  open,
  onOpenChange,
  type,
  categories,
  initialData,
  onSubmit,
}: CategoryDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      parentId: null,
      audit: "Active",
      status: "Active",
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        parentId: initialData.parentId,
        audit: initialData.audit,
        status: initialData.status,
      })
    } else {
      form.reset({
        name: "",
        parentId: null,
        audit: "Active",
        status: "Active",
      })
    }
  }, [initialData, form])

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values)
    form.reset()
  }

  // Filter categories of the same type for parent selection
  const availableParents = categories.filter(cat => 
    cat.type === type && cat._id !== initialData?._id
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Category" : `Add New ${type === 'inflow' ? 'Inflow' : 'Outflow'} Category`}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {availableParents.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="audit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audit</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audit status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                {initialData ? "Update Category" : "Add Category"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

