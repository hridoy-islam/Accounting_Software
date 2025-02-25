import { useEffect, useState } from "react";
import { Search } from 'lucide-react';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CategorySelector } from "./category-selector";

export function TransactionFilters({
  categories,
  methods,
  storages,
  onFiltersChange,
  onApplyFilters
}) {
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    category: "",
    method: "",
    storage: "",
    
  });

  const [fromDate, setFromDate] = useState<string | undefined>(undefined);
  const [toDate, setToDate] = useState<string | undefined>(undefined);

  // Apply filters and trigger fetch
  const handleApplyFilters = () => {       
    onApplyFilters({...filters, fromDate, toDate});
  }; 

  // Handle filter change and date range
  useEffect(() => {
    onFiltersChange({
      ...filters,
    });
  }, [filters, fromDate,toDate, onFiltersChange]);
 

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
        />

        {/* <Select
          value={filters.category}
          onValueChange={(value) => setFilters({ ...filters, category: value })}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select Method" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}

        <Select
          value={filters.method}
          onValueChange={(value) => setFilters({ ...filters, method: value })}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select Method" />
          </SelectTrigger>
          <SelectContent>
            {methods.map((method) => (
              <SelectItem key={method._id} value={method._id}>
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
              <SelectItem key={storage._id} value={storage._id}>
                {storage.storageName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Picker */}
        <div className="flex gap-4">
          <div className="flex justify-center gap-2 items-center">
            <Label>From Date</Label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate( e.target.value)}
              className="w-[250px] py-[4px] px-2 border rounded-md border-gray-300"
            />
          </div>

          <div className="flex justify-center gap-2 items-center">
            <Label>To Date</Label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate( e.target.value )}
              className="w-[250px] px-2 py-[4px] border rounded-md border-gray-300"
            />
          </div>
        </div>


        <Button  className="ml-auto bg-black hover:bg-black/80 text-white" onClick={handleApplyFilters}>
          Filter
        </Button>
      </div>
    </div>
  );
}
