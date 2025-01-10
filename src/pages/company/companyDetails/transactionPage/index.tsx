import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import CompanyNav from '../../components/CompanyNav';
import AddTransaction from '@/pages/company/companyDetails/transactionPage/components/AddTransaction.jsx';
import { Button } from '@/components/ui/button';

interface Transaction {
  id: string;
  tcid: string;
  transactionDate: Date;
  transactionAmount: number;
  transactionCategory: string;
  transactionMethod: string;
  transactionType: 'inflow' | 'outflow';
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    tcid: 'TC001',
    transactionDate: new Date('2025-01-01'),
    transactionAmount: 5000,
    transactionCategory: 'Sales',
    transactionMethod: 'Bank Transfer',
    transactionType: 'inflow',
  },
  {
    id: '2',
    tcid: 'TC002',
    transactionDate: new Date('2025-01-03'),
    transactionAmount: -1500,
    transactionCategory: 'Utilities',
    transactionMethod: 'Credit Card',
    transactionType: 'outflow',
  },
  {
    id: '3',
    tcid: 'TC003',
    transactionDate: new Date('2025-01-05'),
    transactionAmount: 2000,
    transactionCategory: 'Investment',
    transactionMethod: 'Cash',
    transactionType: 'inflow',
  },
  {
    id: '4',
    tcid: 'TC004',
    transactionDate: new Date('2025-01-07'),
    transactionAmount: -750,
    transactionCategory: 'Office Supplies',
    transactionMethod: 'Debit Card',
    transactionType: 'outflow',
  },
];

const TransactionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pagination logic
  const indexOfLastTransaction = currentPage * itemsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto p-6">
      <CompanyNav />
      <h1 className="mb-8 text-2xl font-semibold">Transactions</h1>
      <div className="flex justify-end mb-4">
        <AddTransaction />
      </div>
      <div className="flex gap-8">
        <div className="flex-grow">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">TCID</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Method</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{transaction.tcid}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {transaction.transactionDate.toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{transaction.transactionType}</td>
                  <td className="border border-gray-300 px-4 py-2">{transaction.transactionAmount}</td>
                  <td className="border border-gray-300 px-4 py-2">{transaction.transactionCategory}</td>
                  <td className="border border-gray-300 px-4 py-2">{transaction.transactionMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="mt-4 flex justify-center items-center gap-2 py-4">
            <Button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-1 bg-gray-300 rounded-lg"
            >
              Previous
            </Button>
            <span className="mx-2">
              Page {currentPage} of {Math.ceil(transactions.length / itemsPerPage)}
            </span>
            <Button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(transactions.length / itemsPerPage)}
              className="px-2 py-1 bg-gray-300 rounded-lg"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionPage;
