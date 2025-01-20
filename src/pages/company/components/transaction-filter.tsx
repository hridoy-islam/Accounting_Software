import { useEffect, useState } from "react";
import { Search, Calendar } from 'lucide-react';
import { format } from "date-fns";
import axiosInstance from '../../../lib/axios';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

import { Category } from "@/types";
import { CategorySelector } from "./category-selector";
import { Label } from "@/components/ui/label";
import moment from "moment";

export function TransactionFilters({
  categories,
  methods,
  storages,
  onFiltersChange,
  onApplyFilters
}) {
  const [filters, setFilters] = useState({
    search: "",
    type: "inflow",
    category: "",
    method: "",
    storage: "",
    
  });

  // const [date, setDate] = useState<{ from: Date | null; to: Date | null }>({
  //   from: null,
  //   to: null,
  // });

  // const [date, setDate] = useState<{ from: string | undefined; to: string | undefined }>({
  //   from: "2025-01-01", // Set default "from" date (YYYY-MM-DD)
  //   to: format(new Date(), "yyyy-MM-dd"), // Set default "to" date (today)
  // });

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


        <Button variant='theme' className="ml-auto" onClick={handleApplyFilters}>
          Filter
        </Button>
      </div>
    </div>
  );
}
