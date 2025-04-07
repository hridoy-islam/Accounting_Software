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
import { ArchiveX, Loader, Pen, Trash, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import { useState } from 'react';
import { ConfirmModal } from './ConfirmModal';
import { TransactionDetailsDialog } from './TransactionDetailsDialog';
import { ImageUploader } from './transactionDoc-uploader';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onArchive: (transactionId: string) => void;
  loading: boolean;
  categories: any;
  methods: any;
  storages: any;
}

export function TransactionTable({
  transactions,
  onEdit,
  onArchive,
  loading,
  categories,
  methods,
  storages
}: TransactionTableProps) {
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Transaction | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const handleArchive = async () => {
    if (!selectedTransaction) return;

    try {
      await axiosInstance.patch(`/transactions/${selectedTransaction._id}`, {
        isDeleted: true
      });

      onArchive(selectedTransaction._id);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    } finally {
      setIsModalOpen(false);
      setSelectedTransaction(null);
    }
  };

  const handleUploadComplete = (data) => {
    setUploadOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex h-10 w-full flex-col items-center justify-center">
          <div className="flex flex-row items-center gap-4">
            <p className="font-semibold">Please Wait..</p>
            <div className="h-5 w-5 animate-spin rounded-full border-4 border-dashed border-theme"></div>
          </div>
        </div>
      ) : (
        <div className="">
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
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.tcid} className="text-left">
                  <TableCell onClick={() => setSelectedRow(transaction)}>
                    {transaction.tcid}
                  </TableCell>
                  <TableCell onClick={() => setSelectedRow(transaction)}>
                    {moment(transaction.transactionDate).format('YYYY-MM-DD')}
                  </TableCell>
                  <TableCell onClick={() => setSelectedRow(transaction)}>
                    <Badge
                      className={
                        transaction.transactionType === 'inflow'
                          ? 'bg-inflow'
                          : 'bg-outflow'
                      }
                    >
                      {transaction.transactionType}
                    </Badge>
                  </TableCell>
                  <TableCell
                    onClick={() => setSelectedRow(transaction)}
                    className="font-semibold"
                  >
                    £{transaction.transactionAmount.toFixed(2)}
                  </TableCell>
                  <TableCell onClick={() => setSelectedRow(transaction)}>
                    {transaction.transactionCategory?.name}
                  </TableCell>
                  <TableCell onClick={() => setSelectedRow(transaction)}>
                    {transaction.transactionMethod?.name}
                  </TableCell>
                  <TableCell onClick={() => setSelectedRow(transaction)}>
                    {transaction.storage?.storageName}
                  </TableCell>
                  <TableCell>
                    <div className="flex w-full flex-row justify-end gap-2">
                      <Button
                        variant="theme"
                        size="icon"
                       
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setUploadOpen(true);
                        }}
                      >
                        <Upload />
                      </Button>
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
        </div>
      )}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleArchive}
        title="Archive Transaction"
        description="Are you sure you want to archive this transaction? This action can be undone from Archive Page."
      />

      <TransactionDetailsDialog
        transaction={selectedRow}
        onOpenChange={(open) => !open && setSelectedRow(null)}
      />

      <ImageUploader
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploadComplete={handleUploadComplete}
        entityId={selectedTransaction?._id}
      />
    </div>
  );
}
