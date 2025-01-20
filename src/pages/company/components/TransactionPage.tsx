import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Transaction, TransactionFilters as Filters } from "@/types"
import { TransactionFilters } from "./transaction-filter"
import { TransactionTable } from "./transaction-table"
import { TransactionDialog } from "./transaction-dialog"
import axiosInstance from '@/lib/axios'
import { useParams } from "react-router-dom"
import { ImageUploader } from "@/components/shared/image-uploader"
import { DataTablePagination } from "@/components/shared/data-table-pagination"
export default function TransactionPage() {
  const { id } = useParams();
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState([]);
  const [methods, setMethods] = useState([]);
  const [storages, setStorages] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const handleFiltersChange = (newFilters: Filters) => {
    
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setDialogOpen(true)
  }
  const [filters, setFilters] = useState({ searchTerm: ""});

  const fetchData = async (page, entriesPerPage, filters) => {
    try {
      const { searchTerm} = filters;

      const [transactionsRes, categoriesRes, methodsRes, storagesRes] = await Promise.all([
        axiosInstance.get(`/transactions?companyId=${id}`, {
          params: {
            page,
            limit: entriesPerPage,
            searchTerm,
            
          },
        }),
        axiosInstance.get('/categories?limit=all'),
        axiosInstance.get('/methods?limit=all'),
        axiosInstance.get(`/storages?companyId=${id}`),
      ]);

      setTransactions(transactionsRes.data.data.result);
      setTotalPages(transactionsRes.data.data.meta.totalPage);
      setCategories(categoriesRes.data.data.result);
      setMethods(methodsRes.data.data.result);
      setStorages(storagesRes.data.data.result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage, filters); // Refresh data
  }, [currentPage, entriesPerPage]);


  
  const onSubmit= async(payload)=>{
    await axiosInstance.post('/transactions', payload);
    fetchData(currentPage, entriesPerPage, filters);
  }
  
  return (
    <div className="p-6 space-y-6 rounded-md bg-white mt-6 shadow-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <div className="space-x-2">
          <Button 
            variant="secondary" 
            onClick={() => setDialogOpen(true)}
          >
            Add Transaction
          </Button>
            <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>Upload CSV</Button>
            <ImageUploader 
              open={uploadDialogOpen} 
              onOpenChange={setUploadDialogOpen} 
              onUploadComplete={() => {}} 
              companyId={id}
            />
          <Button variant="outline">Download CSV Example</Button>
          <Button variant="destructive">Export PDF</Button>
        </div>
      </div>

      <TransactionFilters
        categories={categories}
        methods={methods}
        storages={storages}
        onFiltersChange={handleFiltersChange}
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


  )
}

