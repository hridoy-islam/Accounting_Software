import React, { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import NestedCategoryDropdown from './NestedCategoryDropdown';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  categories,
  transactionMethods,
  storageOptions
} from './transactionData';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

const AddTransaction = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    transactionCategory: '',
    transactionDate: null,
    invoiceNumber: '',
    invoiceDate: null,
    details: '',
    description: '',
    transactionAmount: '',
    transactionDoc: '',
    transactionMethod: '',
    storage: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleDateChange = (date, field) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: date
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)} className="hover:bg-[#a78bfa] hover:text-white">Add Transaction</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-full overflow-y-auto p-4 sm:max-w-[600px] md:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add New Transaction
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Transaction Category */}
            <div className="space-y-2">
              <Label htmlFor="transactionCategory">Transaction Category</Label>
              <NestedCategoryDropdown
                categories={[
                  {
                    name: 'Inflow',
                    categoryId: 'inflow',
                    children: categories.TransactionCategory.inflow.categories
                  },
                  {
                    name: 'Outflow',
                    categoryId: 'outflow',
                    children: categories.TransactionCategory.outflow.categories
                  }
                ]}
                onSelect={(category) =>
                  handleInputChange({
                    target: { name: 'transactionCategory', value: category }
                  })
                }
              />
            </div>

            {/* Transaction Amount */}
            <div className="space-y-2">
              <Label htmlFor="transactionAmount">Transaction Amount</Label>
              <Input
                id="transactionAmount"
                name="transactionAmount"
                type="number"
                value={formData.transactionAmount}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
          </div>

          {/* Dates Section */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Transaction Date */}
            <div className="space-y-2">
              <Label htmlFor="transactionDate">Transaction Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-[240px] justify-start text-left font-normal',
                      !formData.transactionDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon />
                    {formData.transactionDate ? (
                      format(formData.transactionDate, 'PPP')
                    ) : (
                      <span>Select Transaction Date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.transactionDate}
                    onSelect={(date) =>
                      handleDateChange(date, 'transactionDate')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Invoice Date */}
            <div className="space-y-2">
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-[240px] justify-start text-left font-normal',
                      !formData.invoiceDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon />
                    {formData.invoiceDate ? (
                      format(formData.invoiceDate, 'PPP')
                    ) : (
                      <span>Select Invoice Date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.invoiceDate}
                    onSelect={(date) => handleDateChange(date, 'invoiceDate')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Invoice and Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Details</Label>
              <Input
                id="details"
                name="details"
                value={formData.details}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="min-h-[100px] w-full"
            />
          </div>

          {/* Transaction Method and Storage */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="transactionMethod">Transaction Method</Label>
              <Select
                name="transactionMethod"
                onValueChange={(value) =>
                  handleInputChange({
                    target: { name: 'transactionMethod', value }
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {transactionMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storage">Storage</Label>
              <Select
                name="storage"
                onValueChange={(value) =>
                  handleInputChange({ target: { name: 'storage', value } })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select storage" />
                </SelectTrigger>
                <SelectContent>
                  {storageOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Document Upload */}
          <div className="space-y-2">
            <Label htmlFor="transactionDoc">Transaction Document</Label>
            <Input
              id="transactionDoc"
              name="transactionDoc"
              type="file"
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="mt-6 w-full">
            Add Transaction
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransaction;
