import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

import { Transaction, TransactionFilters as Filters, methods, storages, demoTransactions } from "@/types"
import { demoCategories } from "@/types"
import { TransactionFilters } from "./transaction-filter"
import { TransactionTable } from "./transaction-table"
import { TransactionDialog } from "./transaction-dialog"
import axiosInstance from '@/lib/axios'
import { useParams } from "react-router-dom"

export default function TransactionPage() {
  const { id } = useParams();
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState([]);
  const [methods, setMethods] = useState([]);
  const [storages, setStorages] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [filters, setFilters] = useState<Filters>({
    search: "",
    type: "inflow",
    category: "",
    method: "",
    storage: "",
  })

  const handleFiltersChange = (newFilters: Filters) => {
    
  }

  const handleAddTransaction = (data: Partial<Transaction>) => {
    const newTransaction: Transaction = {
      tcid: `TC${Math.floor(Math.random() * 1000000)}`,
      date: new Date().toISOString(),
      ...data,
    } as Transaction

    setTransactions([...transactions, newTransaction])
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setDialogOpen(true)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsRes, categoriesRes, methodsRes, storagesRes] = await Promise.all([
          axiosInstance.get(`/transactions?companyId=${id}`),
          axiosInstance.get('/categories?limit=all'),
          axiosInstance.get('/methods?limit=all'),
          axiosInstance.get(`/storages?companyId=${id}`),
        ]);

        setTransactions(transactionsRes.data.data.result);
        setCategories(categoriesRes.data.data.result);
        setMethods(methodsRes.data.data.result);
        setStorages(storagesRes.data.data.result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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
          <Button variant="outline">Upload CSV</Button>
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
        onSubmit={handleAddTransaction}
      />
    </div>
  )
}

