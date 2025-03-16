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
import { EditTransactionDialog } from './components/EditTransactionDialog';

export default function TransactionPage() {
  const { id } = useParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState([]);
  const [methods, setMethods] = useState([]);
  const [storages, setStorages] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
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
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = async (page, entriesPerPage, appliedFilters) => {
    try {
      setLoading(true);
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
    }finally {
      setLoading(false); // Stop loading after fetching
    }
  };
  useEffect(() => {
    fetchData(currentPage, entriesPerPage, appliedFilters);
  }, [currentPage, entriesPerPage, appliedFilters, refreshKey]);

  const refreshTransactions = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };
  

  const handleEditTransaction = async (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditDialogOpen(true);

  };
  const onEditSubmit = async (transaction) => {
    try {
      const payload = { ...transaction }; // Ensure companyId is added
      refreshTransactions();
      await axiosInstance.patch(`/transactions/${transaction._id}`, payload);
    } catch (error) {
      console.error('Error updating category:', error);
    }
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
    // fetchData(currentPage, entriesPerPage, filters);
    refreshTransactions();
  };


  const handleArchiveTransaction = (transactionId: string) => {
    setTransactions((prev) => prev.filter((t) => t._id !== transactionId));
  };


  return (
    <div>
      <div className=" rounded-md bg-white p-4 shadow-lg">
        <div className="flex items-center justify-between pb-2">
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
          onArchive={handleArchiveTransaction}
          loading={loading}
        />

        <TransactionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          categories={categories}
          methods={methods}
          storages={storages}
          onSubmit={onSubmit}
          editingTransaction={editingTransaction}
        />

        <EditTransactionDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          categories={categories}
          methods={methods}
          storages={storages}
          onSubmit={onEditSubmit}
          editingTransaction={editingTransaction}
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
