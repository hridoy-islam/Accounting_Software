import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Transaction, TransactionFilters as Filters } from '@/types';
import { TransactionFilters } from './components/transaction-filter';
import { TransactionTable } from './components/transaction-table';
import { TransactionDialog } from './components/transaction-dialog';
import axiosInstance from '@/lib/axios';
import { useParams } from 'react-router-dom';
import { ImageUploader } from '@/components/shared/image-uploader';
import { DataTablePagination } from '@/components/shared/data-table-pagination';

export default function TransactionPage() {
  const { id } = useParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState([]);
  const [methods, setMethods] = useState([]);
  const [storages, setStorages] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

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

  // Applied filter values (only update these when Apply Filters is clicked)
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const fetchData = async (page, entriesPerPage, appliedFilters) => {
    try {
      const { search, type, category, method, storage, fromDate, toDate } =
        appliedFilters;

      const [transactionsRes, categoriesRes, methodsRes, storagesRes] =
        await Promise.all([
          axiosInstance.get(`/transactions?companyId=${id}`, {
            params: {
              page,
              limit: entriesPerPage,
              searchTerm: search || undefined,
              transactionType: type || undefined,
              transactionCategory: category || undefined,
              transactionMethod: method || undefined,
              storage: storage || undefined,
              startDate: fromDate || undefined,
              endDate: toDate || undefined
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
    fetchData(currentPage, entriesPerPage, appliedFilters);
  }, [currentPage, entriesPerPage, appliedFilters,transactions]);



  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setDialogOpen(true);
  };

  const handleFiltersChange = (filters) => {
    setFilters(filters);
  };

  const handleApplyFilters = (filters) => {
    setAppliedFilters(filters);
    setCurrentPage(1); // Reset to first page when applying new filters
  };

  const onSubmit = async (payload) => {
    await axiosInstance.post('/transactions', payload);
    fetchData(currentPage, entriesPerPage, filters);
  };



  return (
    <div>
  

      <div className=" rounded-md bg-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Transactions</h1>
          <div className="space-x-2">
            <Button variant="theme" onClick={() => setDialogOpen(true)}>
              Add Transaction
            </Button>
            {/* <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
              Upload CSV
            </Button>
            <ImageUploader
              open={uploadDialogOpen}
              onOpenChange={setUploadDialogOpen}
              onUploadComplete={() =>
                fetchData(currentPage, entriesPerPage, filters)
              }
              companyId={id}
              fetchData={undefined}
              currentPage={undefined}
              entriesPerPage={undefined}
              filters={undefined}
            /> */}
            {/* <a href="/sample_transactions.csv" download>
              <Button variant="outline">Download CSV Example</Button>
            </a> */}
            {/* <Button variant="destructive">Export PDF</Button> */}
          </div>
        </div>

        <TransactionFilters
          categories={categories}
          methods={methods}
          storages={storages}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
        />

        <TransactionTable
          transactions={transactions}
          onEdit={handleEditTransaction}
        />

        <TransactionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          categories={categories}
          methods={methods}
          storages={storages}
          onSubmit={onSubmit}
        />

        <DataTablePagination
          pageSize={entriesPerPage}
          setPageSize={setEntriesPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
