import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import { Transaction } from '@/types';
import moment from 'moment';
import { Badge } from '@/components/ui/badge';
import { ArchiveX, Loader2, Pen, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import { useState } from 'react';
import { ConfirmModal } from './ConfirmModal';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onArchive: (transactionId: string) => void;
  loading: boolean;
}

export function TransactionTable({
  transactions,
  onEdit,
  onArchive,
 loading,
}: TransactionTableProps) {
  
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
 

  const handleArchive = async () => {
    if (!selectedTransaction) return;
    
    try {
      await axiosInstance.patch(`/transactions/${selectedTransaction._id}`, {
        isDeleted: true,
      });

      onArchive(selectedTransaction._id);
    } catch (error) {
      console.error("Error deleting transaction:", error);
    } finally {
     
      setIsModalOpen(false);
      setSelectedTransaction(null);
    }
  };
  return (

    <div className="space-y-4">
       {loading ? (
        <div className="flex justify-center items-center py-6">
          <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
        </div>
      ) :(
      <div className="">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">TCID</TableHead>
              <TableHead className="text-right">Transaction Date</TableHead>
              <TableHead className="text-right">Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Category</TableHead>
              <TableHead className="text-right">Method</TableHead>
              <TableHead className="text-right">Storage</TableHead>
              <TableHead className="text-right">Action</TableHead>
              {/* <TableHead className="text-right">Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.tcid} className="text-right">
                <TableCell>{transaction.tcid}</TableCell>
                <TableCell>
                  {moment(transaction.transactionDate).format('YYYY-MM-DD')}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      transaction.transactionType === 'inflow'
                        ? `bg-green-300`
                        : 'bg-red-300'
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
                <TableCell>
                  <div className="flex w-full flex-row justify-end gap-4">
                    <Button
                      variant="theme"
                      size="icon"
                      onClick={() => onEdit(transaction)}
                    >
                      <Pen />
                    </Button>
                    <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      setSelectedTransaction(transaction);
                      setIsModalOpen(true);
                    }}
                  >
                    
                      <ArchiveX />
                  
                  </Button>
                  </div>
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
      </div>)}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleArchive}
        title="Archive Transaction"
        description="Are you sure you want to archive this transaction? This action can be undone from Archive Page."
      />
    </div>
  );
}
