import { useEffect, useState } from "react"
import { Search, Calendar } from 'lucide-react'
import { format } from "date-fns"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { TransactionFilters } from "@/types"
import { Category } from "@/types"
import { CategorySelector } from "./category-selector"

interface TransactionFiltersProps {
  categories: Category[]
  methods: string[]
  storages: string[]
  onFiltersChange: (filters: TransactionFilters) => void
}

export function TransactionFilters({
  categories,
  methods,
  storages,
  onFiltersChange,
}: TransactionFiltersProps) {
  const [filters, setFilters] = useState<TransactionFilters>({
    search: "",
    type: "inflow",
    category: "",
    method: "",
    storage: "",
  })

  const [date, setDate] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  useEffect(() => {
    onFiltersChange({
      ...filters,
      dateRange: date.from && date.to ? { from: date.from, to: date.to } : undefined,
    })
  }, [filters, date, onFiltersChange])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Transactions..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-8"
            />
          </div>
        </div>

        <CategorySelector
          categories={categories}
          onSelect={(categoryId) => setFilters({ ...filters, category: categoryId })}
          onTypeChange={(type) => setFilters({ ...filters, type })}
          defaultType={filters.type}
          className="min-w-[300px]"
        />

        <Select
          value={filters.method}
          onValueChange={(value) => setFilters({ ...filters, method: value })}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select Method" />
          </SelectTrigger>
          <SelectContent>
            {methods.map((method) => (
              <SelectItem key={method} value={method}>
                {method.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.storage}
          onValueChange={(value) => setFilters({ ...filters, storage: value })}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select Storage" />
          </SelectTrigger>
          <SelectContent>
            {storages.map((storage) => (
              <SelectItem key={storage} value={storage}>
                {storage.storageName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[300px] justify-start text-left font-normal">
              <Calendar className="mr-2 h-4 w-4" />
              {date.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={date.from}
              selected={{ from: date.from, to: date.to }}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-between">
        <div className="space-x-2">
          <Button variant="outline">Today's Report</Button>
          <Button variant="outline">Weekly Report</Button>
          <Button variant="outline">Monthly Report</Button>
        </div>
        <Button variant="destructive">Export PDF</Button>
      </div>
    </div>
  )
}

