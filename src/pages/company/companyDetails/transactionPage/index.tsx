import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import CompanyNav from '../../components/CompanyNav';
import AddTransaction from '@/pages/company/companyDetails/transactionPage/components/AddTransaction.jsx';

interface Transaction {
  id: string;
  tcid: string;
  transactionDate: Date;
  invoiceNumber?: string;
  invoiceDate?: Date;
  details?: string;
  description?: string;
  transactionAmount: number;
  transactionDoc?: File;
  transactionCategory: string;
  transactionMethod: string;
  storage: string;
  transactionType: 'inflow' | 'outflow';
}

const TransactionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    transactionType: 'inflow',
    transactionDate: new Date(),
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTransaction((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewTransaction((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (
    date: Date,
    field: 'transactionDate' | 'invoiceDate'
  ) => {
    if (date) {
      setNewTransaction((prev) => ({ ...prev, [field]: date }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files) {
      setNewTransaction((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add API call to save the transaction
    console.log('Saving transaction:', newTransaction);
    setIsDialogOpen(false);
    // Refresh transactions list
  };

  return (
    <div className="container mx-auto p-6">
      <CompanyNav />

      <h1 className="mb-8 text-2xl font-semibold">Transactions</h1>
    {/* Add Transaction Component */}
    <div className="flex justify-end mb-4">
      <AddTransaction />
    </div>
      <div className="flex gap-8">
        {/* Main Table Content */}
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.tcid}</TableCell>
                  <TableCell>
                    {transaction.transactionDate.toLocaleDateString()}
                  </TableCell>
                  <TableCell>{transaction.transactionType}</TableCell>
                  <TableCell>{transaction.transactionAmount}</TableCell>
                  <TableCell>{transaction.transactionCategory}</TableCell>
                  <TableCell>{transaction.transactionMethod}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        
      </div>
    </div>
  );
};

export default TransactionPage;
