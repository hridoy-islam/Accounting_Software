import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CompanyNav from '../../components/CompanyNav';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'; // Add Dialog imports
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select'; // Add Select imports
import { Input } from '@/components/ui/input'; // Add Input component
import { Label } from '@/components/ui/label'; // Add Label component
import { Textarea } from '@/components/ui/textarea'; // Add Textarea component
import { Pen, Trash } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import axiosInstance from '@/lib/axios';
import { ImageUploader } from '@/components/shared/image-uploader';

// Sample categories and transactionMethods
export const categories = {
  TransactionCategory: {
    inflow: {
      categories: [
        {
          name: 'Revenue',
          categoryId: '1',
          children: [
            { name: 'Sales', categoryId: '1' },
            { name: 'Services', categoryId: '1' },
            { name: 'Interest', categoryId: '1' }
          ]
        },
        {
          name: 'Loan',
          categoryId: '2',
          children: [
            { name: 'Bank Loan', categoryId: '2' },
            { name: 'Personal Loan', categoryId: '2' }
          ]
        }
      ]
    },
    outflow: {
      categories: [
        {
          name: 'Advertise',
          categoryId: '3',
          children: [
            { name: 'Online Ads', categoryId: '3' },
            { name: 'Print Ads', categoryId: '3' }
          ]
        },
        {
          name: 'Utility Bill',
          categoryId: '4',
          children: [
            { name: 'Water Bill', categoryId: '4' },
            { name: 'Electricity Bill', categoryId: '4' },
            { name: 'Internet Bill', categoryId: '4' }
          ]
        }
      ]
    }
  }
};

const transactionMethods = ['Cash', 'Credit', 'Bank Transfer', 'Paypal'];

const storageOptions = ['Local', 'Cloud', 'Hybrid'];

interface Transaction {
  transactionType: string;
  transactionDate: Date;
  invoiceNumber?: string;
  invoiceDate?: Date;
  details?: string;
  description?: string;
  transactionAmount: number;
  transactionDoc?: string;
  transactionCategory: string;
  transactionMethod: string;
  storage: string;
}

const TransactionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

  const initialFormData = {
    transactionType: '',
    transactionCategory: '',
    transactionDate: '',
    invoiceDate: '',
    details: '',
    description: '',
    transactionAmount: '',
    transactionDoc: '',
    transactionMethod: '',
    storage: ''
  };
  const [isOpen, setIsOpen] = useState(false);
  const [isCSVOpen, setIsCSVOpen] = useState(false);
  const [formData, setFormData] = useState({
    transactionType: '',
    transactionCategory: '',
    transactionDate: '',
    invoiceDate: '',
    details: '',
    description: '',
    transactionAmount: '',
    transactionDoc: '',
    transactionMethod: '',
    storage: ''
  });

  const fetchData = async () => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/transactions`);
      setTransactions(response.data.data.result);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setInitialLoading(false); // Disable initial loading after the first fetch
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
      ...(name === 'transactionType' && {
        transactionCategory: '' // Reset category when transaction type changes
      })
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      transactionType: transaction.transactionType,
      transactionCategory: transaction.transactionCategory,
      transactionDate: new Date(transaction.transactionDate)
        .toISOString()
        .split('T')[0],
      invoiceDate: transaction.invoiceDate
        ? new Date(transaction.invoiceDate).toISOString().split('T')[0]
        : '',
      details: transaction.details || '',
      description: transaction.description || '',
      transactionAmount: transaction.transactionAmount.toString(),
      transactionDoc: transaction.transactionDoc || '',
      transactionMethod: transaction.transactionMethod,
      storage: transaction.storage
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactions((prevTransactions) =>
        prevTransactions.filter((transaction) => transaction._id !== id)
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.transactionType) {
      alert('Transaction Type is required');
      return;
    }

    const newTransaction: Transaction = {
      transactionType: formData.transactionType,
      transactionDate: new Date(formData.transactionDate),
      transactionAmount: parseFloat(formData.transactionAmount),
      transactionCategory: formData.transactionCategory,
      transactionMethod: formData.transactionMethod,
      storage: formData.storage,
      description: formData.description,
      details: formData.details,
      invoiceDate: formData.invoiceDate
        ? new Date(formData.invoiceDate)
        : undefined
    };
    if (editingTransaction) {
      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction._id === editingTransaction.id
            ? newTransaction
            : transaction
        )
      );
    } else {
      setTransactions((prevTransactions) => [
        ...prevTransactions,
        newTransaction
      ]);
    }

    // addTransaction(newTransaction);
    setFormData(initialFormData);
    setIsOpen(false); // Close the dialog after submission
  };

  // Filter categories based on transaction type
  const filteredCategories =
    formData.transactionType &&
    Array.isArray(
      categories.TransactionCategory[formData.transactionType]?.categories
    )
      ? categories.TransactionCategory[formData.transactionType].categories
      : [];

  // Get subcategories for the selected category
  const selectedCategory =
    filteredCategories.find(
      (cat) => cat.name === formData.transactionCategory
    ) || {};
  const subCategories = selectedCategory?.children || [];

  const handleCSVButtonClick = () => {
    setIsCSVOpen(true);
  };
  return (
    <div className=" py-6">
      <CompanyNav />
      <div className="rounded-md bg-white p-4 shadow-lg">
        <h1 className="mb-8 text-2xl font-semibold">Transactions</h1>
        <div className="mb-4 flex justify-between">
          <Input
            placeholder="Search Transactions..."
            className="max-w-md border-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Update search query state
          />
          <div className="flex items-center justify-center gap-4">
            <div>
              <Button variant="theme" onClick={handleCSVButtonClick}>
                Upload CSV
              </Button>
              <ImageUploader
                open={isCSVOpen}
                onOpenChange={setIsCSVOpen}
                onUploadComplete={() => console.log('Upload Complete')}
                companyId={id}
              />
            </div>

            <Dialog
              open={isOpen}
              onOpenChange={(open) => {
                if (!open) {
                  setEditingTransaction(null);
                  setFormData(initialFormData);
                }
                setIsOpen(open);
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={() => setIsOpen(true)} variant="theme">
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] w-full overflow-y-auto p-4 sm:max-w-[600px] md:p-6">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">
                    {' '}
                    {editingTransaction
                      ? 'Edit Transaction'
                      : 'Add New Transaction'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Transaction Type */}
                    <div className="space-y-2">
                      <Label htmlFor="transactionType">Transaction Type</Label>
                      <Select
                        name="transactionType"
                        onValueChange={(value) =>
                          handleSelectChange('transactionType', value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            className="hover:bg-[#a78bfa]"
                            value="inflow"
                          >
                            Inflow
                          </SelectItem>
                          <SelectItem
                            className="hover:bg-[#a78bfa]"
                            value="outflow"
                          >
                            Outflow
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Transaction Category */}
                    <div className="space-y-2">
                      <Label htmlFor="transactionCategory">
                        Transaction Category
                      </Label>
                      <Select
                        name="transactionCategory"
                        onValueChange={(value) =>
                          handleSelectChange('transactionCategory', value)
                        }
                        disabled={!formData.transactionType} // Disable until type is selected
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredCategories?.map((category) => (
                            <li key={category.id} className="space-y-2">
                              <SelectItem
                                className="hover:bg-[#a78bfa]"
                                value={category.name}
                              >
                                {category.name}
                              </SelectItem>
                              {category.children &&
                                category.children.length > 0 && (
                                  <ul className="pl-4">
                                    {category.children.map((childCategory) => (
                                      <li
                                        key={childCategory.id}
                                        className="space-y-2"
                                      >
                                        <SelectItem
                                          className="hover:bg-[#a78bfa]"
                                          value={childCategory.name}
                                        >
                                          {childCategory.name}
                                        </SelectItem>
                                        {childCategory.children &&
                                          childCategory.children.length > 0 && (
                                            <ul className="pl-4">
                                              {childCategory.children.map(
                                                (subChildCategory) => (
                                                  <li key={subChildCategory.id}>
                                                    <SelectItem
                                                      className="hover:bg-[#a78bfa]"
                                                      value={
                                                        subChildCategory.name
                                                      }
                                                    >
                                                      {subChildCategory.name}
                                                    </SelectItem>
                                                  </li>
                                                )
                                              )}
                                            </ul>
                                          )}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                            </li>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Subcategory
                  {subCategories.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="subCategory">Subcategory</Label>
                      <Select
                        name="subCategory"
                        onValueChange={(value) =>
                          handleSelectChange('subCategory', value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {subCategories.map((subCategory) => (
                            <SelectItem
                              className="hover:bg-[#a78bfa]"
                              key={subCategory.name}
                              value={subCategory.name}
                            >
                              {subCategory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )} */}

                  {/* Transaction Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="transactionAmount">
                      Transaction Amount
                    </Label>
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

                  {/* Dates Section */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="transactionDate">Transaction Date</Label>
                      <Input
                        id="transactionDate"
                        name="transactionDate"
                        type="date"
                        value={formData.transactionDate}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invoiceDate">Invoice Date</Label>
                      <Input
                        id="invoiceDate"
                        name="invoiceDate"
                        type="date"
                        value={formData.invoiceDate}
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

                  <div className="space-y-2">
                    <Label htmlFor="details">Details</Label>
                    <Textarea
                      id="details"
                      name="details"
                      value={formData.details}
                      onChange={handleInputChange}
                      className="min-h-[80px] w-full"
                      placeholder="Add any additional details about the transaction"
                    />
                  </div>

                  {/* Transaction Method and Storage */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="transactionMethod">
                        Transaction Method
                      </Label>
                      <Select
                        name="transactionMethod"
                        onValueChange={(value) =>
                          handleSelectChange('transactionMethod', value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          {transactionMethods.map((method) => (
                            <SelectItem
                              className="hover:bg-[#a78bfa]"
                              key={method}
                              value={method}
                            >
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
                          handleSelectChange('storage', value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select storage" />
                        </SelectTrigger>
                        <SelectContent>
                          {storageOptions.map((option) => (
                            <SelectItem
                              className="hover:bg-[#a78bfa]"
                              key={option}
                              value={option}
                            >
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="mt-6 w-full bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80"
                  >
                    Add Transaction
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="flex gap-8 pb-4">
          <div className="flex-grow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TCID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Storage</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>{transaction.tcid}</TableCell>
                    <TableCell>
                      {new Date(
                        transaction.transactionDate
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{transaction.transactionType}</TableCell>
                    <TableCell>${transaction.transactionAmount}</TableCell>
                    <TableCell>
                      {transaction.transactionCategory.name}
                    </TableCell>
                    <TableCell>{transaction.transactionMethod.name}</TableCell>
                    <TableCell>{transaction.storage.storageName}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className='"border-none bg-[#a78bfa] text-white hover:bg-[#a78bfa]/80'
                          onClick={() => handleEdit(transaction)}
                        >
                          <Pen className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(transaction.tcid)}
                          className="border-none bg-red-500 text-white hover:bg-red-500/90"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionPage;
