
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Transaction } from "@/types"
import moment from "moment"
import { Badge } from "@/components/ui/badge"

interface TransactionTableProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
}

export function TransactionTable({
  transactions,
  onEdit,
}: TransactionTableProps) {
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
              {/* <TableHead className="text-right">Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
        
              <TableRow key={transaction.tcid}>
                <TableCell>{transaction.tcid}</TableCell>
                <TableCell>{moment(transaction.transactionDate).format('YYYY-MM-DD')}</TableCell>
                <TableCell><Badge className={transaction.transactionType === 'inflow' ? `bg-green-300`: 'bg-red-300'}>{transaction.transactionType.toUpperCase()}</Badge></TableCell>
                <TableCell className="font-semibold">£{Number(transaction.transactionAmount.toFixed(2))}</TableCell>
                <TableCell>{transaction.transactionCategory.name}</TableCell>
                <TableCell>{transaction.transactionMethod.name}</TableCell>
                <TableCell>{transaction.storage.storageName}</TableCell>
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

      
    </div>
  )
}

