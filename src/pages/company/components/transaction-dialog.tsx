import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import axiosInstance from '@/lib/axios'
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
import { Textarea } from "@/components/ui/textarea"
import { Transaction, methods, storages } from "@/types"
import { Category } from "@/types"
import { CategorySelector } from "./category-selector"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"

const formSchema = z.object({
    transactionDate: z.date(),
    invoiceNumber: z.string().min(1, "Invoice number is required"),
    invoiceDate: z.date(),
    details: z.string().min(1, "Details are required"),
    description: z.string().optional(),
    type: z.enum(["inflow", "outflow"]),
    amount: z.string().min(1, "Amount is required"),
    category: z.string().min(1, "Category is required"),
    method: z.string().min(1, "Method is required"),
    storage: z.string().min(1, "Storage is required"),
})

interface TransactionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    categories: Category[]
    onSubmit: (data: Partial<Transaction>) => void
}

export function TransactionDialog({
    open,
    onOpenChange,
    categories,
    onSubmit,
}: TransactionDialogProps) {
    const [file, setFile] = useState<File | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "inflow",
            details: "",
            description: "",
        },
    })

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log(values)
        try {
            const formData = new FormData()
            formData.append("transactionDate", values.transactionDate.toISOString())
            formData.append("invoiceNumber", values.invoiceNumber)
            formData.append("invoiceDate", values.invoiceDate.toISOString())
            formData.append("details", values.details)
            formData.append("description", values.description || "")
            formData.append("type", values.type)
            formData.append("amount", values.amount)
            formData.append("category", values.category)
            formData.append("method", values.method)
            formData.append("storage", values.storage)
            if (file) {
                formData.append("transactionDoc", file)
            }

            await axiosInstance.post("/api/transactions", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })

            onSubmit({
                ...values,
                amount: parseFloat(values.amount),
                transactionDoc: file,
            })

            form.reset()
            setFile(null)
            onOpenChange(false)
        } catch (error) {
            console.error("Error submitting transaction:", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Add New Transaction</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                            <Label>Transaction Date</Label>
                            <Input type="date" />
                            </div>
                            <FormField
                                control={form.control}
                                name="invoiceNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Invoice Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter invoice number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Invoice Date</Label>
                            <Input type="date" />
                            </div>
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type & Category</FormLabel>
                                        <FormControl>
                                            <CategorySelector
                                                categories={categories}
                                                onSelect={(categoryId) => form.setValue("category", categoryId)}
                                                onTypeChange={(type) => {
                                                    form.setValue("type", type)
                                                    form.setValue("category", "")
                                                }}
                                                defaultType={field.value}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="details"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Details</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter transaction details" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Enter amount" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter description"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="method"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Method</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select method" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {methods.map((method) => (
                                                    <SelectItem key={method} value={method}>
                                                        {method}
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
                                name="storage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Storage</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select storage" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {storages.map((storage) => (
                                                    <SelectItem key={storage} value={storage}>
                                                        {storage}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Transaction Document Upload */}
                        <FormItem>
                            <FormLabel>Transaction Document</FormLabel>
                            <FormControl>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                        id="transactionDoc"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById("transactionDoc")?.click()}
                                        className="w-full"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        {file ? file.name : "Upload Document"}
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>

                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Add Transaction</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

