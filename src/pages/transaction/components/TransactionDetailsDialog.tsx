import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, FileIcon } from 'lucide-react';
import { Transaction } from '@/types';
import moment from 'moment';

interface TransactionDetailsDialogProps {
  transaction: Transaction | null;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetailsDialog({
  transaction,
  onOpenChange
}: TransactionDetailsDialogProps) {
  if (!transaction) return null;

  const getDisplayValue = (field: any): string => {
    if (field === null || field === undefined) return 'N/A';
    if (typeof field === 'string') return field;
    if (typeof field === 'number') return field.toString();
    if (typeof field === 'boolean') return field ? 'Yes' : 'No';

    if (typeof field === 'object') {
      // Handle objects with common name fields
      if (field.name) return field.name;
      if (field.storageName) return field.storageName;
      if (field.label) return field.label;
      if (field._id) return field._id;
      // For other objects, return a safe string representation
      try {
        return JSON.stringify(field);
      } catch {
        return 'N/A';
      }
    }
    return 'N/A';
  };

  return (
    <Dialog open={!!transaction} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] lg:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            Transaction Details
            {transaction.tcid && (
              <span className="text-sm text-gray-500">
                ({getDisplayValue(transaction.tcid)})
              </span>
            )}
            {transaction.transactionType && (
              <Badge
                className={`capitalize ${
                  transaction.transactionType === 'inflow'
                    ? 'bg-green-300'
                    : 'bg-red-300'
                }`}
              >
                {getDisplayValue(transaction.transactionType)}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Amount Section */}
        <div className="border-b pb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              £ {getDisplayValue(transaction.transactionAmount)}
            </span>
            
          </div>
        </div>

        <div className="space-y-6 py-4">
          {/* Main Grid - 3 Columns */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Left Grid - Basic Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Transaction Date</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {moment(transaction.transactionDate).format('MM/DD/YYYY')}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">
                  {getDisplayValue(transaction.transactionCategory)}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium">
                  {getDisplayValue(transaction.transactionMethod)}
                </p>
              </div>

              {transaction.storage && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Storage</p>
                  <p className="font-medium">
                    {getDisplayValue(transaction.storage)}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {(transaction.invoiceNumber || transaction.invoiceDate) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Invoice Information</h3>
                  </div>
                  <div className="space-y-2">
                    {transaction.invoiceNumber && (
                      <div>
                        <p className="text-sm text-gray-500">Invoice Number</p>
                        <p className="font-medium">
                          {getDisplayValue(transaction.invoiceNumber)}
                        </p>
                      </div>
                    )}
                    {transaction.invoiceDate && (
                      <div>
                        <p className="text-sm text-gray-500">Invoice Date</p>
                        <p className="font-medium">
                          {moment(transaction.invoiceDate).format('MM/DD/YYYY')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(transaction.description || transaction.details) && (
                <div className="space-y-4">
                  {transaction.description && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-sm">
                        {getDisplayValue(transaction.description)}
                      </p>
                    </div>
                  )}

                  {transaction.details && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Details</p>
                      <p className="text-sm">
                        {getDisplayValue(transaction.details)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Grid - Document Link */}

            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">Transaction Document</h3>
                {transaction.transactionDoc ? (
                  <a
                    href={getDisplayValue(transaction.transactionDoc)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <FileIcon className="h-4 w-4" />
                    <span>View Document</span>
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">No Document Available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
