import { useEffect, useState } from "react"
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Pen } from 'lucide-react'
import axiosInstance from "@/lib/axios"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Transaction } from "@/types"
import { useParams } from "react-router-dom"
import moment from "moment"

interface TransactionTableProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
}

export function TransactionTable({
  transactions,
  onEdit,
}: TransactionTableProps) {
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [categories, setCategories] = useState([]);
  const [methods, setMethods] = useState([]);
  const [storages, setStorages] = useState([]);
  const {id} = useParams();

  const totalPages = Math.ceil(transactions.length / rowsPerPage)
  const start = (page - 1) * rowsPerPage
  const end = start + rowsPerPage
  const currentTransactions = transactions.slice(start, end)

   useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, methodsRes, storagesRes] = await Promise.all([
          axiosInstance.get('/categories?limit=all'),
          axiosInstance.get('/methods?limit=all'),
          axiosInstance.get(`/storages?companyId=${id}`),
        ]);

        setCategories(categoriesRes.data.data.result || []);
        setMethods(methodsRes.data.data.result || []);
        setStorages(storagesRes.data.data.result || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [id]);

  
  return (
    <div className="space-y-4">
      <div className="">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>TCID</TableHead>
              <TableHead>Transaction Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Storage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTransactions.map((transaction) => (
        
              <TableRow key={transaction.tcid}>
                <TableCell>{transaction.tcid}</TableCell>
                <TableCell>{moment(transaction.transactionDate).format('YYYY-MM-DD')}</TableCell>
                <TableCell>{transaction.transactionType}</TableCell>
                <TableCell className="font-semibold">£{Number(transaction.transactionAmount.toFixed(2))}</TableCell>
                <TableCell>{transaction.transactionCategory.name}</TableCell>
                <TableCell>{transaction.transactionMethod.name}</TableCell>
                <TableCell>{transaction.storage.storageName}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(transaction)}
                  >
                    <Pen className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      
    </div>
  )
}

