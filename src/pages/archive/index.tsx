import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Transaction, TransactionFilters as Filters } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import moment from 'moment';
import { Badge } from '@/components/ui/badge';
import { ArchiveRestore, Pen, Trash } from 'lucide-react';

import axiosInstance from '@/lib/axios';
import { useParams } from 'react-router-dom';
import { TransactionFilters } from '../transaction/components/transaction-filter';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { ConfirmModal } from '../transaction/components/ConfirmModal';

export default function ArchivePage() {
  const { id } = useParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState([]);
  const [methods, setMethods] = useState([]);
  const [storages, setStorages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    method: '',
    storage: ''
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  const fetchData = async (page, entriesPerPage) => {
    try {
      const { search, type, category, method, storage, fromDate, toDate } =
        appliedFilters;

      const [transactionsRes, categoriesRes, methodsRes, storagesRes] =
        await Promise.all([
          axiosInstance.get(`/transactions/company/${id}`, {
            params: {
              page,
              limit: entriesPerPage,
              searchTerm: search || undefined,
              transactionType: type || undefined,
              transactionCategory: category || undefined,
              transactionMethod: method || undefined,
              storage: storage || undefined,
              startDate: fromDate || undefined,
              endDate: toDate || undefined,
              isDeleted: true
            }
          }),
          axiosInstance.get(`/categories/company/${id}?limit=all`),
          axiosInstance.get(`/methods/company/${id}?limit=all`),
          axiosInstance.get(`/storages/company/${id}?limit=all`)
        ]);

      setTransactions(transactionsRes.data.data.result);
      setTotalPages(transactionsRes.data.data.meta.totalPage);
      setCategories(categoriesRes.data.data.result);
      setMethods(methodsRes.data.data.result);
      setStorages(storagesRes.data.data.result);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    fetchData(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage]);

  const handleFiltersChange = (filters) => {
    setFilters(filters);
  };

  const handleApplyFilters = (filters) => {
    setAppliedFilters(filters);
    setCurrentPage(1); // Reset to first page when applying new filters
  };


  const unArchiveTransaction = async (transactionId) => {
    try {
      await axiosInstance.patch(`/transactions/${transactionId}`, {
        isDeleted: false
      });
      // Optionally, refresh the transaction list or handle state change
      // setTransactions((prevTransactions) =>
      //   prevTransactions.map((transaction) =>
      //     transaction._id === transactionId
      //       ? { ...transaction, isDeleted: false }
      //       : transaction
      //   )
      // );
    } catch (error) {
      console.error('Error unarchiving transaction:', error);
    }
  };



  const handleConfirmUnarchive = () => {
    if (selectedTransactionId) {
      unArchiveTransaction(selectedTransactionId);
      setTransactions((prevTransactions) =>
        prevTransactions.filter((transaction) => transaction._id !== selectedTransactionId)
      );
    }
    setShowConfirmModal(false);
  };


  return (
    <div className="rounded-md bg-white p-4 mb-2 shadow-lg">
      <div className="flex items-center justify-between pb-2">
      <h1 className='text-3xl font-bold'>Archived Transactions</h1>


      </div>
      <TransactionFilters
        categories={categories}
        methods={methods}
        storages={storages}
        onFiltersChange={handleFiltersChange}
        onApplyFilters={handleApplyFilters}
      />

      <div className="pb-2 ">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">TCID</TableHead>
              <TableHead className="text-left">Transaction Date</TableHead>
              <TableHead className="text-left">Type</TableHead>
              <TableHead className="text-left">Amount</TableHead>
              <TableHead className="text-left">Category</TableHead>
              <TableHead className="text-left">Method</TableHead>
              <TableHead className="text-left">Storage</TableHead>
              <TableHead className="text-right">Restore</TableHead>
              {/* <TableHead className="text-right">Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.tcid} className="text-left">
                <TableCell>{transaction.tcid}</TableCell>
                <TableCell>
                  {moment(transaction.transactionDate).format('YYYY-MM-DD')}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      transaction.transactionType === 'inflow'
                        ? `bg-inflow`
                        : 'bg-outflow'
                    }
                  >
                    {transaction.transactionType.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold">
                  £{transaction.transactionAmount.toFixed(2)}
                </TableCell>
                <TableCell>{transaction.transactionCategory.name}</TableCell>
                <TableCell>{transaction.transactionMethod.name}</TableCell>
                <TableCell>{transaction.storage.storageName}</TableCell>
                <TableCell className='text-right'>
                <Button
                    className='bg-green-500 text-white hover:bg-green-600'
                    size="icon"
                    onClick={() => {
                      setSelectedTransactionId(transaction._id);
                      setShowConfirmModal(true);
                    }}
                  >
                    <ArchiveRestore />
                  </Button>
                </TableCell>
                {/* <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(transaction)}
                  >
                    <Pen className="h-4 w-4" />
                  </Button>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        pageSize={entriesPerPage}
        setPageSize={setEntriesPerPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

<ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmUnarchive}
        title="Unarchive Transaction"
        description="Are you sure you want to unarchive this transaction?"
      />
    </div>
  );
}
