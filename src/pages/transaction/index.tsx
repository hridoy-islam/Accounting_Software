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
import { RefreshCcw } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';


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
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const {hasPermission} = usePermission();

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
          axiosInstance.get(`/categories/company/${id}?limit=10000`),
          axiosInstance.get(`/methods/company/${id}?limit=10000`),
          axiosInstance.get(`/storages/company/${id}?limit=10000`)
        ]);

      setTransactions(transactionsRes.data.data.result);
      setTotalPages(transactionsRes.data.data.meta.totalPage);
      setCategories(categoriesRes.data.data.result);
      setMethods(methodsRes.data.data.result);
      setStorages(storagesRes.data.data.result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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

  const onEditSubmit = async (transaction: Transaction) => {
    try {
      // Prepare the payload with proper ID extraction
      const payload = {
        ...transaction,
        transactionCategory: typeof transaction.transactionCategory === 'object'
          ? transaction.transactionCategory._id
          : transaction.transactionCategory,
        transactionMethod: typeof transaction.transactionMethod === 'object'
          ? transaction.transactionMethod._id
          : transaction.transactionMethod,
        storage: typeof transaction.storage === 'object'
          ? transaction.storage._id
          : transaction.storage,
      };

      // Make the API call
      const response = await axiosInstance.patch(
        `/transactions/${transaction._id}`,
        payload
      );

      const getReference = (id: string, collection: any[]) =>
        collection.find(item => item._id === id) || { _id: id, name: 'Unknown' };

      const transactionCategory = getReference(
        payload.transactionCategory,
        categories
      );
      const transactionMethod = getReference(
        payload.transactionMethod,
        methods
      );
      const storage = getReference(
        payload.storage,
        storages
      );

      // Create the updated transaction with resolved references
      const updatedTransaction = {
        ...response.data.data,
        transactionCategory,
        transactionMethod,
        storage
      };

      // Update state
      setTransactions(prev => prev.map(t =>
        t._id === transaction._id ? updatedTransaction : t
      ));
      setEditDialogOpen(false);

    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleFiltersChange = (filters) => {
    setFilters(filters);
  };

  const handleApplyFilters = (filters) => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };


  const onSubmit = async (payload) => {
    try {
      const response = await axiosInstance.post('/transactions', payload);

      const transactionCategory = categories.find(c => c._id === payload.transactionCategory);
      const transactionMethod = methods.find(m => m._id === payload.transactionMethod);
      const storage = storages.find(s => s._id === payload.storage);

      const newTransaction = {
        ...response.data.data,
        transactionCategory,
        transactionMethod,
        storage
      };

      setTransactions(prev => [newTransaction, ...prev]);
      setDialogOpen(false);

    } catch (error) {
      console.error('Error submitting transaction:', error);
    }
  };



  const handleArchiveTransaction = (transactionId: string) => {
    setTransactions((prev) => prev.filter((t) => t._id !== transactionId));
  };


  return (
    <div>
      <div className=" rounded-md bg-white p-4 shadow-lg">
        <div className="flex items-center justify-between pb-2">
          <h1 className="text-3xl font-bold">Transactions</h1>
          <div className="space-x-2 flex flex-row items-center justify-center ">
            <Button variant="theme" onClick={() => refreshTransactions()}>
              <div className='flex flex-row items-center justify-center gap-2'>
                <RefreshCcw size='18' />
                Refresh
              </div>
            </Button>
            {hasPermission('TransactionList', 'create') &&(
            <Button variant="theme" onClick={() => setDialogOpen(true)}>
              Add Transaction
            </Button>)}
            
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
          categories={categories}
          methods={methods}
          storages={storages}
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
